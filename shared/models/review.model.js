const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hotelid: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true},
    bookingid: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', trim: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String, trim: true },
        status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
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
reviewSchema.index({ status: 1 });
reviewSchema.index({ helpfulCount: -1 });

module.exports = mongoose.model('Review', reviewSchema);
