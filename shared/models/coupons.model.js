const mongoose = require("mongoose");
const couponsSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  code: {
    type: String,
    required: true,
    min: 5,
    max: 50,
    uppercase: true,
    trim: true,
    index: true,
    unique: true,
  },
  discountType: {
    type: String,
    required: true,
    default: "percentage",
    enum: [
      "percentage", // 20% off
      "fixed_amount", // $50 off
      "free_night", // 4th night free
      "early_bird", // Book X days in advance
      "last_minute", // Book within X days
      "long_stay", // 10% off for 7+ nights
      "weekday_discount", // Monday-Thursday discount
      "weekend_discount", // Friday-Sunday discount
      "seasonal", // Summer sale
      "loyalty_tier", // Gold members get extra 10%
      "bundle_discount", // Book hotel + activity
    ],
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function (value) {
        if (this.discountType === "percentage") {
          return value <= 100;
        }
        return true;
      },
      message: "Percentage discount cannot exceed 100",
    },
  },
  minPurchase: { type: Number, default: 0.0, min: 0 },
  maxDiscount: {
    type: Number,
    default: null,
    validate: {
      validator: function (value) {
        if (this.discountType !== "percentage") {
          return value === null;
        }
        return true;
      },
      message: "maxDiscount is only applicable for percentage discounts",
    },
  },
  validFrom: {
    type: Date,
    required: true,
    default: Date.now,
  },
  validTo: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value > this.validFrom;
      },
      message: "validTo must be after validFrom",
    },
  },
  usedCount: {
    type: Number,
    default: null,
    min: 1,
  },
  usageLimit: {
    type: Number,
    default: null,
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  applicableBooking: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "booking",
    },
  ],
});

couponsSchema.virtual("isExpired").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.validFrom &&
    now <= this.validTo &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

couponsSchema.virtual("remainingUses").get(function () {
  if (this.usageLimit === null) return Infinity;
  return Math.max(0, this.usageLimit - this.usedCount);
});

couponsSchema.virtual("effectiveDiscountType").get(function () {
  if (this.discountType === "free_night") {
    return `Buy ${this.discountValue - 1} nights, get ${this.discountValue
      }th free`;
  }
  return this.discountType;
});

module.exports = mongoose.model("Coupons", couponsSchema);
