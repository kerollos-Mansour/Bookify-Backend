const mongoose = require('mongoose');

const amenitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Amenity name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: {
            values: ['room', 'hotel', 'both'],
            message: 'Category must be either room, hotel, or both'
        },
        default: 'both'
    }
}, {
    timestamps: true
});

// Add indexes for better query performance
amenitySchema.index({ category: 1 });
amenitySchema.index({ name: 1 });

module.exports = mongoose.model('Amenity', amenitySchema);
