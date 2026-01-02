const refreshService = require("../services/refresh.service");
const catchAsync = require("../../../shared/utils/catchError.utils");

exports.refreshToken = catchAsync(async (req, res) => {
    const result = await refreshService.refreshToken(req);

    res.status(200).json({
        status: "success",
        data: result,
    });
});


