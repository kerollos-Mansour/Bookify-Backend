const User = require("../../../shared/models/user.model");
const ApiError = require("../../../shared/utils/appError.utils");
const {
    verifyRefreshToken,
    generateToken,
    generateRefreshToken,
} = require("../../../shared/utils/token.util");

exports.refreshToken = async (req) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError("Refresh token is required", 400);
    }

    try {
        // Verify the refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user with this refresh token
        const user = await User.findOne({
            _id: decoded.id,
            refreshToken: refreshToken,
        });

        if (!user) {
            throw new ApiError("Invalid refresh token", 401);
        }

        // Generate new tokens
        const newAccessToken = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Update user's refresh token
        user.refreshToken = newRefreshToken;
        await user.save();

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
            },
        };
    } catch (error) {
        throw new ApiError("Invalid or expired refresh token", 401);
    }
};

