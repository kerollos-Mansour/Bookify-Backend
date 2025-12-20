const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'User ID is required']
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: [true, 'Hotel ID is required'],
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: [true, 'Room ID is required'],
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required'],
    validate: {
      validator: function (date) {
        return date > new Date();
      },
      message: "Check-in date must be in the future",
    },
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function (date) {
        return date > this.checkIn;
      },
      message: "Check-out must be after check-in",
    },
  },
  nights: {
    type: Number,
    required: [true, 'Number of nights is required'],
    min: [1, 'Nights must be at least 1']
  },
  subTotal: {
    type: Number,
    required: [, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price per night cannot be negative']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  // guests: {
  //   type: Number,
  //   default: 1,
  //   max: [10, 'Maximum 10 guests allowed'],
  //   required: [true, 'Number of guests is required']
  // },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD'
  },
  status: {
    type: String,
    required: [true, 'Booking status is required'],
    default: "pending",
    enum: {
      values: ["pending", "confirmed", "cancelled", "completed", "no-show"],
      message: '{VALUE} is not a valid booking status'
    }
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Coupon",
    default: null
  },
  // payment 
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    default: "pending",
    enum: {
      values: ["unpaid","pending", "paid", "failed"],
      message: '{VALUE} is not a valid payment status'
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ["stripe", "paypal", "cash", "other"],
      message: '{VALUE} is not a valid payment method'
    }
  },
  paymentIntentId: {
    type: String,
    required: [true, 'Payment intent ID is required']
  },

  createdAt: {
    type: Date,
    required: [true, 'Created date is required'],
    default: Date.now
  },
  paymentIntentId: { type: String, unique: true, sparse: true },

  bookingNumber: {
    type: String,
    required: [true, 'Booking number is required'],
    unique: true
  },
  fees: { type: Number, default: 0 }
  // createdAt: {
  //   type: Date,
  //   required: [true, 'Created date is required'],
  //   default: Date.now
  // },
  // updatedAt: {
  //   type: Date
  // },
},{ timestamps: true });

// Add indexes for better query performance
bookingSchema.index({ userId: 1 });
bookingSchema.index({ hotelId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Booking", bookingSchema);

