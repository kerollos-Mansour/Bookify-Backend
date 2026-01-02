const authService = require('../services/auth.service');
const catchAsync = require("../../../shared/utils/catchError.utils");
const { sendNotificationToUser } = require("../../../sockets");
const passport = require("../../../shared/config/passport.config");
const { generateToken, generateRefreshToken } = require("../../../shared/utils/token.util");


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

    res.status(200).json({
        status: 'success',
        data: resetToken
    })
})

exports.resetPassword = catchAsync(async (req, res) => {
    const result = await authService.resetPassword(req.body);

    res.status(200).json({
        status: 'success',
        data: result
    })
})

// Google OAuth - Initiate
exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

// Google OAuth - Callback
exports.googleAuthCallback = [
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed` }),
    catchAsync(async (req, res) => {
        // Generate tokens
        const accessToken = generateToken(req.user);
        const refreshToken = generateRefreshToken(req.user);

        // Save refresh token
        req.user.refreshToken = refreshToken;
        await req.user.save();

        // Send notification
        if (req.user && req.user._id) {
            await sendNotificationToUser(req.user._id, {
                type: "system",
                title: "Welcome to Bookify!",
                message: "You've successfully signed in with Google!",
                data: {},
            });
        }

        // Redirect to frontend with tokens
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            avatar: req.user.avatar,
        }))}`;

        res.redirect(redirectUrl);
    })
];