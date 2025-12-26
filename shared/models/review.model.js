const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userid: { type: String, required: true, trim: true },
    hotelid: { type: String, required: true, trim: true },
    bookingid: { type: String, trim: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, trim: true },
    reviewDate: { type: Date, default: Date.now },
    helpfulCount: { type: Number, default: 0, min: 0 }
}, {
    timestamps: true
});
// Add indexes for better query performance
reviewSchema.index({ hotelid: 1 });
reviewSchema.index({ userid: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ reviewDate: -1 });
reviewSchema.index({ helpfulCount: -1 });

module.exports = mongoose.model('Review', reviewSchema);
