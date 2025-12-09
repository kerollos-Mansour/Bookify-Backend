const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hotels",
    required: true,
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "rooms",
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
    validate: {
      validator: function (date) {
        return date > new Date();
      },
      message: "Check-in date must be in the future",
    },
  },
  checkOut: {
    type: Date,
    required: true,
    validate: {
      validator: function (date) {
        return date > this.checkIn;
      },
      message: "Check-out must be after check-in",
    },
  },
  nights: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  pricePerNight: { type: Number, required: true },
  totalPrice: { type: Number, required: true, min: 0 },
  guests: { type: Number, default: 1, max: 10, required: true },
  currency: { type: String, required: true },
  status: {
    type: String,
    required: true,
    default: "pending",
    enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
  },
  bookingNumber: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date },
});

module.exports = mongoose.model("Booking", bookingSchema);
