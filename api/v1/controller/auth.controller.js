const authService = require('../services/auth.service');
const catchAsync = require("../../../shared/utils/catchError.utils");


exports.register = catchAsync(async (req, res) => {
    const registerUser = await authService.register(req.body);

    res.status(201).json({
        status: 'success',
        data: registerUser
    })
})

exports.login = catchAsync(async (req, res) => {
    const loginUser = await authService.login(req.body);

    res.status(201).json({
        status: 'success',
        data: loginUser
    })
})