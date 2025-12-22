const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require("../../../shared/models/booking.model");
const AppError = require("../../../shared/utils/appError.utils");

const createPaymentIntent = async (user, data) => {
  const { bookingId, currency = "usd" } = data;

  if (!bookingId) {
    throw new AppError("Booking ID is required", 400);
  }

  // 1) Find booking
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.userId.toString() !== user._id.toString() && !user.isAdmin) {
    throw new AppError("Access denied", 403);
  }

  // 2) Calculate amount in cents
  // Stripe expects amount in the smallest currency unit
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
      userId: user._id.toString(),
    },
  });

    // Save intent ID in booking
  booking.paymentIntentId = paymentIntent.id;
  booking.paymentStatus = "unpaid";
  // await booking.save();
await booking.save({ validateBeforeSave: false });
  return { clientSecret: paymentIntent.client_secret };
};

module.exports = { createPaymentIntent };
