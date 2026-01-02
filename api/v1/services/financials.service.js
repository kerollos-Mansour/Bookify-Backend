const Booking = require("../../../shared/models/booking.model");
const Coupon = require("../../../shared/models/coupons.model");

exports.getRevenueStats = async (req) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Build filter based on user role
    let bookingFilter = {};
    if (userRole === "vendor") {
        const Hotel = require("../../../shared/models/hotel.model");
        const hotels = await Hotel.find({ ownerId: userId });
        const hotelIds = hotels.map((h) => h._id);
        bookingFilter = { hotelId: { $in: hotelIds } };
    }

    const revenueStats = await Booking.aggregate([
        {
            $match: {
                ...bookingFilter,
                paymentStatus: "paid",
                status: { $ne: "cancelled" }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalPrice" },
                count: { $sum: 1 },
                avgBookingValue: { $avg: "$totalPrice" }
            }
        }
    ]);

    const monthlyRevenue = await Booking.aggregate([
        {
            $match: {
                ...bookingFilter,
                paymentStatus: "paid",
                status: { $ne: "cancelled" }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                revenue: { $sum: "$totalPrice" },
                bookings: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);

    return {
        total: revenueStats[0] || { totalRevenue: 0, count: 0, avgBookingValue: 0 },
        monthly: monthlyRevenue
    };
};

exports.getTransactions = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Build filter based on user role
    let bookingFilter = { paymentStatus: { $in: ["paid", "refunded"] } };
    if (userRole === "vendor") {
        const Hotel = require("../../../shared/models/hotel.model");
        const hotels = await Hotel.find({ ownerId: userId });
        const hotelIds = hotels.map((h) => h._id);
        bookingFilter.hotelId = { $in: hotelIds };
    }

    const transactions = await Booking.find(bookingFilter)
        .populate("userId", "name email")
        .populate("hotelId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Booking.countDocuments(bookingFilter);

    return {
        transactions,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        }
    };
};

exports.getCouponUsageStats = async () => {
    const couponStats = await Coupon.aggregate([
        {
            $lookup: {
                from: "bookings",
                localField: "_id",
                foreignField: "couponId",
                as: "bookings"
            }
        },
        {
            $project: {
                code: 1,
                isActive: 1,
                discountType: 1,
                discountValue: 1,
                usageCount: { $size: "$bookings" },
                totalDiscountedAmount: { $sum: "$bookings.totalPrice" }
            }
        },
        { $sort: { usageCount: -1 } }
    ]);

    return { stats: couponStats };
};
