const dashboardService = require("../services/dashboard.service");
const catchAsync = require("../../../shared/utils/catchError.utils");

exports.getStats = catchAsync(async (req, res) => {
    const stats = await dashboardService.getStats(req);

    res.status(200).json({
        status: "success",
        data: stats,
    });
});

exports.getRevenueData = catchAsync(async (req, res) => {
    const revenueData = await dashboardService.getRevenueData(req);

    res.status(200).json({
        status: "success",
        data: revenueData,
    });
});

exports.getBookingsByStatus = catchAsync(async (req, res) => {
    const bookingsByStatus = await dashboardService.getBookingsByStatus(req);

    res.status(200).json({
        status: "success",
        data: bookingsByStatus,
    });
});
