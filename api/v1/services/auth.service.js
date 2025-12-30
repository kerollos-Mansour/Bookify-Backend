const User = require("../../../shared/models/user.model");
const ApiError = require("../../../shared/utils/appError.utils");
const catchAsync = require("../../../shared/utils/catchError.utils");
const {
  generateToken,
  generateRefreshToken,
} = require("../../../shared/utils/token.util");
const crypto = require("crypto");
const sendEmail = require('../../../shared/utils/email.util');
const emailTemplates = require('../../../shared/utils/emailTemplates.utils');

exports.register = async (userData) => {
  const { username, name, phoneNo, email, password,isAdmin } = userData;
  console.log(userData)
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
  const user = await User.create({ username, name, phoneNo, email, password,isAdmin });

  const accessToken = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();
  // email
  sendEmail({
    email,
    subject: "Welcome to Bookify",
    html: emailTemplates.welcomeTemplate(name)
  })
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
    throw new ApiError("Email and password are required", 400);
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError("Invalid email or password", 400);
  }

  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    throw new ApiError("Invalid email or password", 400)
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

exports.forgotPassword = async (userData) => {
  try {
    const { email } = userData;

    if (!email) {
      throw new ApiError("Email is required", 400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const resetToken = crypto.randomInt(100000, 999999).toString();
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    sendEmail({
      email,
      subject: "Password Reset",
      html: emailTemplates.forgotPasswordTemplate(resetURL)
    })

    user.resetToken = resetToken;
    await user.save();

    return resetToken;
  } catch (error) {
    throw new ApiError(error.message, 500);
  }
}