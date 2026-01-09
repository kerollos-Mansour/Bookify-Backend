const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require("../../../shared/models/booking.model");
const AppError = require("../../../shared/utils/appError.utils");

const FlightBooking = require("../../../shared/models/flightBooking.model");

const createPaymentIntent = async (user, data) => {
  const { bookingId, bookingType = "hotel", currency = "usd" } = data;

  if (!bookingId) {
    throw new AppError("Booking ID is required", 400);
  }

  let booking;
  if (bookingType === "flight") {
    booking = await FlightBooking.findById(bookingId);
  } else {
    booking = await Booking.findById(bookingId);
  }

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  // Admin override or user ownership check
  // Note: FlightBooking uses userId as an object or id, ensure consistency
  const bookingUserId = booking.userId._id ? booking.userId._id.toString() : booking.userId.toString();

  if (bookingUserId !== user._id.toString() && !user.isAdmin) {
    throw new AppError("Access denied", 403);
  }

  // 2) Calculate amount in cents
  const amountInCents = Math.round(booking.totalPrice * 100);

  if (amountInCents <= 0) {
    throw new AppError("Payment amount must be greater than 0", 400);
  }

  // 3) Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency,
    metadata: {
      bookingId: booking._id.toString(),
      bookingType, // Add metadata to know which model to update on webhook
      userId: user._id.toString(),
    },
  });

  // Save intent ID in booking
  booking.paymentIntentId = paymentIntent.id;
  booking.paymentStatus = "unpaid";

  if (bookingType === "flight") {
    await booking.save();
  } else {
    await booking.save({ validateBeforeSave: false });
  }

  return { clientSecret: paymentIntent.client_secret };
};

module.exports = { createPaymentIntent };
