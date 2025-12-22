const paymentService = require("../services/paymentStripe.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require("../../../shared/models/booking.model");
/**
 * POST /api/v1/payments/stripe/create-intent
 */
exports.createStripePaymentIntent = catchAsync(async (req, res) => {
  const paymentIntent = await paymentService.createPaymentIntent(
    req.user,
    req.body
  );

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    message: "Payment intent created",
    data: paymentIntent,
  });
});

exports.handleStripeWebhook = (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // RAW body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const intent = event.data.object;
  const bookingId = intent.metadata?.bookingId;

  if (!bookingId) {
    return res.status(200).json({ received: true });
  }

  if (event.type === "payment_intent.succeeded") {
    Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "paid",
      status: "confirmed",
    }).exec();
  }

  if (event.type === "payment_intent.payment_failed") {
    Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: "failed",
    }).exec();
  }

  res.json({ received: true });
};