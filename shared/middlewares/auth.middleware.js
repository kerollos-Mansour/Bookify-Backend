const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const AppError = require("../utils/appError.utils");
const catchAsync = require("../utils/catchError.utils");

/**
 * Protect routes (requires login)
 */
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in Please login to access", 401));
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists", 401)
    );
  }

  // Add user to request
  req.user = currentUser;
  next();
});

/**
 * Restrict to admin
 */
exports.restrictToAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(new AppError("You do not have permission to perform this action", 403));
  }
  next();
};
