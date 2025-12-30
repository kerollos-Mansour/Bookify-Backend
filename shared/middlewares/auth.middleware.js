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


/**
 * Restrict to specific roles (flexible)
 * Usage: restrictTo('admin', 'vendor')
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

/**
 * Ensure vendors can only access their own resources
 * Requires hotelId or ownerId in params/body
 */
exports.restrictToVendorOwnResources = async (req, res, next) => {
  try {
    // Admins can access all resources
    if (req.user.role === 'admin' || req.user.isAdmin) {
      return next();
    }

    // For vendors, check ownership
    if (req.user.role === 'vendor') {
      const Hotel = require('../models/hotel.model');

      // Get hotelId from params or body
      const hotelId = req.params.id || req.params.hotelId || req.body.hotelId;

      if (!hotelId) {
        return next(new AppError("Hotel ID is required", 400));
      }

      // Check if hotel belongs to vendor
      const hotel = await Hotel.findById(hotelId);

      if (!hotel) {
        return next(new AppError("Hotel not found", 404));
      }

      if (hotel.ownerId && hotel.ownerId.toString() !== req.user._id.toString()) {
        return next(
          new AppError("You do not have permission to access this resource", 403)
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
