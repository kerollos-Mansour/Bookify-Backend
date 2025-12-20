const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    cardNumber: {
      type: String,
      required: [true, "Card number is required"],
      minlength: [12, "Card number must be at least 12 digits"],
      maxlength: [19, "Card number cannot exceed 19 digits"],
      match: [/^\d+$/, "Card number must contain only digits"],
    },
    bank: { type: String },
    cardHolderName: {
      type: String,
      required: [true, "Card holder name is required"],
      trim: true,
    },
    expiryDate: {
      type: String,
      required: [true, "Expiry date is required"],
      match: [
        /^\d{4}\/(0[1-9]|1[0-2])$/,
        "Expiry date must be in YYYY/MM format",
      ],
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);


paymentMethodSchema.index({ userId: 1 });
paymentMethodSchema.index({ cardNumber: 1 });

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
