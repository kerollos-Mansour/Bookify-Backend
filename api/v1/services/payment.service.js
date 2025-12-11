const Payment = require("../../../shared/models/payment.model");
const Booking = require("../../../shared/models/booking.model");
const PaymentMethod = require("../../../shared/models/paymentMethod.model");
const AppError = require("../../../shared/utils/appError.utils");

/**
 * Create a payment
 */
const createPayment = async (user, data) => {
  const { bookingId, paymentMethodId, amount } = data;

  if (!bookingId || !paymentMethodId) {
    throw new AppError("bookingId and paymentMethodId are required", 400);
  }

  // 1) Check booking
  const booking = await Booking.findById(bookingId);
  if (!booking){
    throw new AppError("Booking not found", 404);
  } 

  if (booking.userId.toString() !== user._id.toString()) {
    throw new AppError("Access denied", 403);
  }

    // 2) Check payment method belongs to user
  const method = await PaymentMethod.findById(paymentMethodId);
  if (!method){
    throw new AppError("Payment method not found", 404);
  } 

  if (method.userId.toString() !== user._id.toString()) {
    throw new AppError("This payment method does not belong to you", 403);
  }

   // 3) Amount
  const payAmount = amount || booking.totalPrice;

    // 4) Create payment
  const payment = new Payment({
    bookingId,
    userId: user._id,
    paymentMethodId,
    amount: payAmount,
    status: "completed",
    transactionId: "TX-" + Date.now()
  });

  await payment.save();

  // 5) Update booking status
  if (booking.status === "pending") {
    booking.status = "confirmed";
    await booking.save();
  }

  return payment;
};

/**
 * Get payment by booking ID
 */
const getPaymentByBookingId = async (bookingId) => {
  const payment = await Payment.findOne({ bookingId }).populate("paymentMethodId", "cardNumber bank cardHolderName");;
  if (!payment){
    throw new AppError("Payment not found", 404);
  } 
  return payment;
};

/**
 * Update payment status (Admin)
 */
const updatePaymentStatus = async (user, paymentId, status) => {
  if (!user.isAdmin){
    throw new AppError("Access denied", 403);
  } 

  const validStatuses = ["pending", "completed", "failed", "refunded"];
  if (!validStatuses.includes(status)){
    throw new AppError("Invalid status", 400);
  } 

  const payment = await Payment.findByIdAndUpdate(paymentId, { status }, { new: true });
  if (!payment){
    throw new AppError("Payment not found", 404);
  } 

  if (status === "refunded") {
    await Booking.findByIdAndUpdate(payment.bookingId, { status: "cancelled" });
  }

  return payment;
};

module.exports = {
  createPayment,
  getPaymentByBookingId,
  updatePaymentStatus
};
