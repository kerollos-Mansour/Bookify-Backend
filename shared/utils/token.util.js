const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: `${process.env.JWT_EXPIRY}h`,
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: `${process.env.JWT_REFRESH_EXPIRY}h`,
  });
};

const AppError = require("./appError.utils");

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Invalid token", 401);
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }
};
module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
};
