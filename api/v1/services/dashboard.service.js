const Booking = require("../../../shared/models/booking.model");
const User = require("../../../shared/models/user.model");
const Hotel = require("../../../shared/models/hotel.model");
const ApiError = require("../../../shared/utils/appError.utils");

/**
 * Calculate statistics with month-over-month comparison
 */
exports.getStats = async (req) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build filter based on user role
    let hotelFilter = {};
    if (userRole === "vendor") {
        // Vendors only see their own hotels
        hotelFilter = { ownerId: userId };
    }

    // Get current month dates
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get hotels (filtered by vendor if needed)
    const hotels = await Hotel.find(hotelFilter);
    const hotelIds = hotels.map((h) => h._id);

    // Total Users
    const totalUsers = await User.countDocuments();
    const usersLastMonth = await User.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });
    const usersThisMonth = await User.countDocuments({
        createdAt: { $gte: startOfCurrentMonth },
    });
    const usersChange =
        usersLastMonth > 0
            ? (((usersThisMonth - usersLastMonth) / usersLastMonth) * 100).toFixed(1)
            : 0;

    // Total Hotels
    const totalHotels = hotels.length;
    const hotelsLastMonth = await Hotel.countDocuments({
        ...hotelFilter,
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });
    const hotelsThisMonth = await Hotel.countDocuments({
        ...hotelFilter,
        createdAt: { $gte: startOfCurrentMonth },
    });
    const hotelsChange =
        hotelsLastMonth > 0
            ? (((hotelsThisMonth - hotelsLastMonth) / hotelsLastMonth) * 100).toFixed(
                1
            )
            : 0;

    // Build booking filter
    let bookingFilter = {};
    if (userRole === "vendor") {
        bookingFilter = { hotelId: { $in: hotelIds } };
    }

    // Active Bookings (confirmed or pending)
    const activeBookings = await Booking.countDocuments({
        ...bookingFilter,
        status: { $in: ["confirmed", "pending"] },
    });
    const activeBookingsLastMonth = await Booking.countDocuments({
        ...bookingFilter,
        status: { $in: ["confirmed", "pending"] },
        createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });
    const activeBookingsThisMonth = await Booking.countDocuments({
        ...bookingFilter,
        status: { $in: ["confirmed", "pending"] },
        createdAt: { $gte: startOfCurrentMonth },
    });
    const bookingsChange =
        activeBookingsLastMonth > 0
            ? (
                ((activeBookingsThisMonth - activeBookingsLastMonth) /
                    activeBookingsLastMonth) *
                100
            ).toFixed(1)
            : 0;

    // Total Revenue (paid bookings)
    const revenueResult = await Booking.aggregate([
        {
            $match: {
                ...bookingFilter,
                paymentStatus: "paid",
                status: { $ne: "cancelled" },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$totalPrice" },
            },
        },
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const revenueLastMonthResult = await Booking.aggregate([
        {
            $match: {
                ...bookingFilter,
                paymentStatus: "paid",
                status: { $ne: "cancelled" },
                createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$totalPrice" },
            },
        },
    ]);
    const revenueLastMonth = revenueLastMonthResult[0]?.total || 0;

    const revenueThisMonthResult = await Booking.aggregate([
        {
            $match: {
                ...bookingFilter,
                paymentStatus: "paid",
                status: { $ne: "cancelled" },
                createdAt: { $gte: startOfCurrentMonth },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: "$totalPrice" },
            },
        },
    ]);
    const revenueThisMonth = revenueThisMonthResult[0]?.total || 0;

    const revenueChange =
        revenueLastMonth > 0
            ? (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
            : 0;

    return {
        totalRevenue,
        revenueChange: parseFloat(revenueChange),
        activeBookings,
        bookingsChange: parseFloat(bookingsChange),
        totalUsers,
        usersChange: parseFloat(usersChange),
        totalHotels,
        hotelsChange: parseFloat(hotelsChange),
    };
};

/**
 * Get revenue data over time
 */
exports.getRevenueData = async (req) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const days = parseInt(req.query.days) || 7;

    // Build filter based on user role
    let hotelFilter = {};
    if (userRole === "vendor") {
        const hotels = await Hotel.find({ ownerId: userId });
        const hotelIds = hotels.map((h) => h._id);
        hotelFilter = { hotelId: { $in: hotelIds } };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueData = await Booking.aggregate([
        {
            $match: {
                ...hotelFilter,
                paymentStatus: "paid",
                status: { $ne: "cancelled" },
                createdAt: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                revenue: { $sum: "$totalPrice" },
            },
        },
        {
            $sort: { _id: 1 },
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                revenue: 1,
            },
        },
    ]);

    return revenueData;
};

/**
 * Get bookings by status
 */
exports.getBookingsByStatus = async (req) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Build filter based on user role
    let hotelFilter = {};
    if (userRole === "vendor") {
        const hotels = await Hotel.find({ ownerId: userId });
        const hotelIds = hotels.map((h) => h._id);
        hotelFilter = { hotelId: { $in: hotelIds } };
    }

    const bookingsByStatus = await Booking.aggregate([
        {
            $match: hotelFilter,
        },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                status: {
                    $concat: [
                        { $toUpper: { $substrCP: ["$_id", 0, 1] } },
                        { $substrCP: ["$_id", 1, { $strLenCP: "$_id" }] },
                    ],
                },
                count: 1,
            },
        },
    ]);

    return bookingsByStatus;
};
