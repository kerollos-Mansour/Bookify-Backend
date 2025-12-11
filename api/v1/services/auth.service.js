const User = require("../../../shared/models/user.model");
const ApiError = require("../../../shared/utils/appError.utils");
const catchAsync = require("../../../shared/utils/catchError.utils");
const {
  generateToken,
  generateRefreshToken,
} = require("../../../shared/utils/token.util");
const crypto = require("crypto");

// now we have 2 options to save users (reqister and create user ) reqister will be easy
// for anyone who want to create an account unlike create_user will be from dashboard 
exports.register = async (userData) => {
  const { username, email, password,isAdmin } = userData;
  if (!username || !email || !password) {
    throw new ApiError("Username, email, and password are required", 400);
  }

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError("Email already exists", 400);
    }
    if (existingUser.username === username) {
      throw new ApiError("Username already exists", 400);
    }
  }
  const user = await User.create({ username, email, password,isAdmin });

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();
  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
};

exports.login = async (userData) => {
  const { email, password } = userData;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(400, "Invalid email or password")
  }

  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid email or password")
  }

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
}
