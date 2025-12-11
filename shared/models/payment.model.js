const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking ID is required"],
    },
    paymentMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: [true, "Payment method ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Payment amount cannot be negative"],
    },
    currency: { type: String, default: "USD" },
    // cardNumber: { type: String },
    // bank: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      message: "{VALUE} is not a valid payment status",
      default: "pending",
    },
    transactionId: { type: String, unique: true },
    paymentDate: {
      type: Date,
      default: Date.now,
      validate: {
        validator: function (date) {
          return date <= new Date();
        },
        message: "Payment date cannot be in the future",
      },
    },
  },
  { timestamps: true }
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ paymentMethodId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
