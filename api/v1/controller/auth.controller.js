const authService = require('../services/auth.service');
const catchAsync = require("../../../shared/utils/catchError.utils");
const { sendNotificationToUser } = require("../../../sockets");


exports.register = catchAsync(async (req, res) => {
    const registerUser = await authService.register(req.body);

    // Notification
    if (registerUser && registerUser._id) {
        await sendNotificationToUser(registerUser._id, {
            type: "system",
            title: "Welcome to Bookify!",
            message: "Thanks for joining us. Start exploring hotels now!",
            data: {},
        });
    }

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
exports.forgotPassword = catchAsync(async (req, res) => {
    const resetToken = await authService.forgotPassword(req.body);

    res.status(201).json({
        status: 'success',
        data: resetToken
    })
})