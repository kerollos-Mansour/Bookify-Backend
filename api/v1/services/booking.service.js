const Booking = require("../../../shared/models/booking.model");
const Room = require("../../../shared/models/rooms.model");
const Coupon = require("../../../shared/models/coupons.model");
const AppError = require("../../../shared/utils/appError.utils");
const emailTemplates = require('../../../shared/utils/emailTemplates.utils');

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
  if (
    !userId ||
    !hotelId ||
    !roomId ||
    !checkIn ||
    !checkOut ||
    !guests

  ) {
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
    throw new AppError("Room not found", 404)
  }

  if (room.hotelId.toString() !== hotelId.toString()) {
    throw new AppError("Room does not belong to the specified hotel", 400)
  }

  // Calculate nights and price
  const oneDay = 24 * 60 * 60 * 1000;
  const nights = Math.round(Math.abs((checkOutDate - checkInDate) / oneDay))

  if (nights < 1) {
    throw new AppError("Booking must be for at least one night", 400);
  }

  const pricePerNight = room.price.original;
  let subTotal = pricePerNight * nights;
  let totalPrice = subTotal;

  // Apply Coupon if provided
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true
    })

    if (!coupon) {
      throw new AppError("Invalid or expired coupon code", 400);
    }

    const now = new Date();
    if (now < new Date(coupon.validFrom) || now > new Date(coupon.validTo)) {
      throw new AppError("Coupon is not valid at this time", 400);
    }
    // Check ~
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new AppError("Invalid check-in or check-out date", 400);
    }
    // Check usage limits
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError("Coupon usage limit has been reached", 400);
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (subTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
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
    bookingNumber: bookingNumber,
    currency,
    paymentIntentId: paymentIntentId || "pending_payment",
    paymentMethod,
    paymentStatus: paymentIntentId ? "pending" : "unpaid", // Status flow
    createdAt: new Date(),
    status: "pending",
  });

  await booking.save();

  // email
  emailTemplates.sendEmail({
    email,
    subject: "Booking Confirmation",
    template: emailTemplates.bookingConfirmationTemplate(data.name, bookingNumber)
  })
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

//   Get all bookings
const getAllBookings = async () => {
  const bookings = await Booking.find();
  return bookings;
};

//   Get a single booking by ID
const getBookingById = async (id) => {
  const booking = await Booking.findById(id);

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

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  cancelBooking,
};
