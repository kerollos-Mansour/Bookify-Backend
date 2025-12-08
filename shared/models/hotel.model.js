const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    address: { type: String },
    city: { type: String },
    stateProvinceCode: { type: String },
    countryCode: { type: String },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 }

});

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, default: 'hotel' },
    images: [{ type: String }],
    tripAdvisorRating: { type: Number, default: 0, min: 0, max: 5 },
    hotelRating: { type: Number, default: 0, min: 0, max: 5 },
    propertyCategory: { type: String },
    confidenceRating: { type: Number },
    lowRate: { type: Number },
    highRate: { type: Number },
    location: locationSchema,
}, { timestamps: true }
);

hotelSchema.index({ "location.city": 1 });
hotelSchema.index({ hotelRating: -1 });
hotelSchema.index({ lowRate: 1 });



module.exports = mongoose.model("Hotel", hotelSchema);