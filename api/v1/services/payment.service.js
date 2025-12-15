const Booking = require("../../../shared/models/booking.model");
const AppError = require("../../../shared/utils/appError.utils");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (bookingData) => {
    const { totalPrice, currency = "usd", bookingId, userId, hotelId, roomId } =
        bookingData;

    if (!totalPrice || totalPrice <= 0) {
        throw new AppError("Invalid amount", 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100), // for cents
        currency: currency.toLowerCase(),
        metadata: {
            bookingId: bookingId || "new",
            userId: userId ? userId.toString() : "",
            hotelId: hotelId ? hotelId.toString() : "",
            roomId: roomId ? roomId.toString() : "",
        },
        automatic_payment_methods: {
            enabled: true,
        },
    });

    return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
    };
};

exports.handlePaymentSuccess = async (paymentIntent) => {
    const { bookingId } = paymentIntent.metadata;

    if (!bookingId || bookingId === 'new') {
        // This payment wasn't linked to an existing booking ID at creation time
        // or it's a new booking flow. 
        return null;
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        throw new AppError("Booking not found", 404);
    }

    booking.paymentStatus = "paid";
    booking.paymentIntentId = paymentIntent.id;
    booking.status = "confirmed";
    booking.updatedAt = new Date();

    await booking.save();
    return booking;
};

exports.constructWebhookEvent = (payload, signature) => {
    return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
    );
};