const User = require("../models/user.model");
const { verifyToken } = require("../utils/token.util");
const catchError = require("../utils/catchError.utils");
const AppError = require("../utils/appError.utils");

const protect = catchError(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new AppError("Not authorized, no token provided", 401);

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");
    req.user = user;
    next();
});

const allowTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You are not allowed to perform this action",
            });
        }
        next();
    };
};

module.exports = { protect, allowTo };
