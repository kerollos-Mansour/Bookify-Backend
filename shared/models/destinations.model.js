const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Destination name is required'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
    },
    price: {
        type: String,
        required: [true, 'Price is required'],
    },
    image: {
        type: String,
        required: [true, 'Image is required'],
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    bestSeller: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5'],
    },
    address: {
        type: String,
        trim: true,
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Add indexes for better query performance
destinationSchema.index({ categoryId: 1 });
destinationSchema.index({ bestSeller: 1 });
destinationSchema.index({ rating: -1 });

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;