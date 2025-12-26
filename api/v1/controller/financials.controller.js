const financialsService = require("../services/financials.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");

exports.getRevenue = catchAsync(async (req, res, next) => {
    const result = await financialsService.getRevenueStats();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: result
    });
});

exports.getTransactions = catchAsync(async (req, res, next) => {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;

    const result = await financialsService.getTransactions(page, limit);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: result
    });
});

exports.getCouponUsage = catchAsync(async (req, res, next) => {
    const result = await financialsService.getCouponUsageStats();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: result
    });
});
