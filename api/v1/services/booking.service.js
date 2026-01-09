const Booking = require("../../../shared/models/booking.model");
const Room = require("../../../shared/models/rooms.model");
const Coupon = require("../../../shared/models/coupons.model");
const AppError = require("../../../shared/utils/appError.utils");
const emailTemplates = require("../../../shared/utils/emailTemplates.utils");
const sendEmail = require("../../../shared/utils/email.util");
const User = require("../../../shared/models/user.model");
const Hotel = require("../../../shared/models/hotel.model");

/**
 * Booking Service
 * Contains all business logic for booking management
 */

const generateBookingNumber = () => {
    const prefix = "BKG";
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // '20260101'
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 'XZ7K2Q'
    return `${prefix}-${dateStr}-${randomPart}`; // → BKG-20260101-XZ7K2Q
};

//   Create a new booking
const createBooking = async (bookingData) => {
    const {
        userId,
        hotelId,
        roomId,
        checkIn,
        checkOut,
        guests,
        couponCode,
        paymentIntentId,
        paymentMethod = "stripe",
        currency = "USD",
    } = bookingData;

    // Validate required fields
    if (!userId || !hotelId || !roomId || !checkIn || !checkOut || !guests) {
        throw new AppError("All required fields must be provided", 400);
    }

    // Parse and validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
        throw new AppError("Check-out date must be after check-in date", 400);
    }

    const room = await Room.findById(roomId);
    if (!room) {
        throw new AppError("Room not found", 404);
    }

    if (room.hotelId.toString() !== hotelId.toString()) {
        throw new AppError("Room does not belong to the specified hotel", 400);
    }

    // Calculate nights and price
    const oneDay = 24 * 60 * 60 * 1000;
    const nights = Math.round(Math.abs((checkOutDate - checkInDate) / oneDay));

    if (nights < 1) {
        throw new AppError("Booking must be for at least one night", 400);
    }

    const pricePerNight =
        room.price.discounted &&
            room.price.discounted > 0 &&
            room.price.discounted < room.price.original
            ? room.price.discounted
            : room.price.original;

    let subTotal = pricePerNight * nights;

    const fees = subTotal * 0.1; // 10% service fee
    let totalPrice = subTotal + fees;

    // Apply Coupon if provided
    let appliedCoupon = null;
    if (couponCode) {
        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
            isActive: true,
        });

        if (!coupon) {
            throw new AppError("Invalid or expired coupon code", 400);
        }

        const now = new Date();
        if (
            now < new Date(coupon.validFrom) ||
            now > new Date(coupon.validTo)
        ) {
            throw new AppError("Coupon is not valid at this time", 400);
        }
        // Check ~
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            throw new AppError("Invalid check-in or check-out date", 400);
        }
        // Check usage limits
        if (
            coupon.usageLimit !== null &&
            coupon.usedCount >= coupon.usageLimit
        ) {
            throw new AppError("Coupon usage limit has been reached", 400);
        }

        let discountAmount = 0;
        if (coupon.discountType === "percentage") {
            discountAmount = (subTotal * coupon.discountValue) / 100;
            if (
                coupon.maxDiscountAmount &&
                discountAmount > coupon.maxDiscountAmount
            ) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else if (coupon.discountType === "fixed_amount") {
            discountAmount = coupon.discountValue;
        }

        // Calculate final price
        totalPrice = Math.max(0, subTotal - discountAmount);
        appliedCoupon = coupon._id;
    }
    // Create booking
    const bookingNumber = generateBookingNumber();
    const booking = new Booking({
        userId,
        hotelId,
        roomId,
        couponId: appliedCoupon,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        guests,
        pricePerNight,
        totalPrice,
        subTotal,
        fees,
        bookingNumber: bookingNumber,
        currency,
        paymentIntentId: paymentIntentId || "pending_payment",
        paymentMethod,
        paymentStatus: paymentIntentId ? "pending" : "unpaid", // Status flow
        createdAt: new Date(),
        status: "pending",
    });

    await booking.save();

    const user = await User.findById(userId);
    // email
    sendEmail({
        email: user.email,
        subject: "Welcome to Bookify",
        html: emailTemplates.welcomeTemplate(user.name),
    });
    return {
        booking,
        metadata: {
            bookingId: booking._id,
            bookingNumber,
            totalPrice,
            nights,
            checkIn: checkInDate.toISOString().split("T")[0],
            checkOut: checkOutDate.toISOString().split("T")[0],
        },
    };
};

//   Get all bookings with filters
const getAllBookings = async (filters) => {
    const { status, search, searchBy, startDate } = filters;
    let query = {};

    // Filter by status
    if (status) {
        query.status = status;
    }

    // Filter by search based on searchBy parameter
    if (search && searchBy) {
        if (searchBy === "Booking Number") {
            query.bookingNumber = { $regex: search, $options: "i" };
        } else if (searchBy === "User Name") {
            const user = await User.findOne({
                name: { $regex: search, $options: "i" },
            });
            if (user) {
                query.userId = user._id;
            } else {
                return []; // No user found, return empty array
            }
        } else if (searchBy === "Hotel Name") {
            const hotel = await Hotel.findOne({
                name: { $regex: search, $options: "i" },
            });
            if (hotel) {
                query.hotelId = hotel._id;
            } else {
                return []; // No hotel found, return empty array
            }
        }
    }

    // Filter by startDate (check-in date)
    if (startDate) {
        const filterDate = new Date(startDate);
        query.checkIn = { $gte: filterDate };
    }

    let bookings = await Booking.find(query)
        .populate("userId", "name")
        .populate("hotelId", "name")
        .sort({ createdAt: -1 });

    return bookings;
};

//   Get a single booking by ID
const getBookingById = async (id) => {
    const booking = await Booking.findById(id)
        .populate("userId", "name username email phoneNo")
        .populate("hotelId", "name location images")
        .populate("roomId", "name bedType price sleeps");

    if (!booking) {
        throw new AppError("Booking not found", 404);
    }

    return booking;
};

//  * Cancel a booking by ID

const cancelBooking = async (id) => {
    const booking = await Booking.findById(id);

    if (!booking) {
        throw new AppError("Booking not found", 404);
    }

    // Check if booking can be cancelled
    if (booking.status === "cancelled") {
        throw new AppError("Booking is already cancelled", 400);
    }

    if (booking.status === "completed") {
        throw new AppError("Cannot cancel a completed booking", 400);
    }

    // Update status to cancelled
    booking.status = "cancelled";
    booking.updatedAt = new Date();
    await booking.save();

    return booking;
};

//  * Update booking status (Admin only)
const updateBookingStatus = async (bookingId, newStatus) => {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new AppError("Booking not found", 404);
    }

    // Validate status
    const validStatuses = [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no-show",
    ];
    if (!validStatuses.includes(newStatus)) {
        throw new AppError(
            `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            400
        );
    }

    // Check state transition rules
    if (booking.status === "completed") {
        throw new AppError("Cannot change status of a completed booking", 400);
    }

    if (booking.status === "cancelled" && newStatus !== "pending") {
        throw new AppError("Cannot change status of a cancelled booking", 400);
    }

    const updateBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { status: newStatus },
        {
            new: true,
            runValidators: true,
        }
    );

    return updateBooking;
};

//  * Update booking details (users can update their own bookings, admins can update any)
const updateBooking = async (bookingId, updateData, userId, isAdmin) => {
    updateData = updateData.newData;
    console.log(updateData);
    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new AppError("Booking not found", 404);
    }

    if (booking.status === "completed") {
        throw new AppError("Cannot update a completed booking", 400);
    }

    const allowedFields = [
        "checkIn",
        "checkOut",
        "pricePerNight",
        "status",
        "paymentStatus",
        "paymentMethod",
        "fees",
    ];

    let updateFields = {};

    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            updateFields[field] = updateData[field];
        }
    }

    // ===== Handle dates update =====
    if (updateData.checkIn || updateData.checkOut) {
        const checkInDate = new Date(updateData.checkIn ?? booking.checkIn);
        const checkOutDate = new Date(updateData.checkOut ?? booking.checkOut);

        if (checkInDate >= checkOutDate) {
            throw new AppError(
                "Check-out date must be after check-in date",
                400
            );
        }

        const oneDay = 24 * 60 * 60 * 1000;
        const nights = Math.ceil((checkOutDate - checkInDate) / oneDay);

        if (nights < 1) {
            throw new AppError("Booking must be at least one night", 400);
        }

        const pricePerNight = updateData.pricePerNight ?? booking.pricePerNight;

        const fees = updateData.fees ?? booking.fees ?? 0;

        const subTotal = pricePerNight * nights;
        const totalPrice = subTotal + fees;

        updateFields.checkIn = checkInDate;
        updateFields.checkOut = checkOutDate;
        updateFields.nights = nights;
        updateFields.pricePerNight = pricePerNight;
        updateFields.subTotal = subTotal;
        updateFields.totalPrice = totalPrice;
        updateFields.fees = fees;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        { $set: updateFields },
        { new: true, runValidators: true }
    );
    console.log(updateFields);
    return updatedBooking;
};

const getUserBookings = async (userId) => {
    const bookings = await Booking.find({ userId });
    return bookings;
};

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    cancelBooking,
    updateBookingStatus,
    updateBooking,
    getUserBookings
};
