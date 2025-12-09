const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    stateProvinceCode: {
        type: String,
        trim: true
    },
    countryCode: {
        type: String,
        trim: true
    },
    latitude: {
        type: Number,
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
        type: Number,
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
    }
});

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hotel name is required'],
        trim: true
    },
    type: {
        type: String,
        default: 'hotel',
        trim: true
    },
    images: [{
        type: String
    }],
    tripAdvisorRating: {
        type: Number,
        default: 0,
        min: [0, 'TripAdvisor rating cannot be negative'],
        max: [5, 'TripAdvisor rating cannot exceed 5']
    },
    hotelRating: {
        type: Number,
        default: 0,
        min: [0, 'Hotel rating cannot be negative'],
        max: [5, 'Hotel rating cannot exceed 5']
    },
    propertyCategory: {
        type: String,
        trim: true
    },
    confidenceRating: {
        type: Number,
        min: [0, 'Confidence rating cannot be negative']
    },
    lowRate: {
        type: Number,
        min: [0, 'Low rate cannot be negative']
    },
    highRate: {
        type: Number,
        min: [0, 'High rate cannot be negative']
    },
    location: locationSchema,
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Add indexes for better query performance
hotelSchema.index({ "location.city": 1 });
hotelSchema.index({ "location.countryCode": 1 });
hotelSchema.index({ hotelRating: -1 });
hotelSchema.index({ lowRate: 1 });
hotelSchema.index({ propertyCategory: 1 });

module.exports = mongoose.model("Hotel", hotelSchema);