const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    airline: {
        type: String,
        required: [true, 'Airline name is required'],
        trim: true
    },
    flightNumber: {
        type: String,
        required: [true, 'Flight number is required'],
        trim: true,
        trim: true
    },
    aircraft: {
        type: String,
        trim: true
    },

    // Departure Information
    departure: {
        airport: {
            code: { type: String, required: true, trim: true }, // e.g., "JFK"
            name: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            country: { type: String, required: true, trim: true },
            terminal: { type: String, trim: true }
        },
        dateTime: {
            type: Date,
            required: [true, 'Departure date/time is required']
        }
    },

    // Arrival Information
    arrival: {
        airport: {
            code: { type: String, required: true, trim: true }, // e.g., "LAX"
            name: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            country: { type: String, required: true, trim: true },
            terminal: { type: String, trim: true }
        },
        dateTime: {
            type: Date,
            required: [true, 'Arrival date/time is required'],
            index: true
        }
    },

    // Duration in minutes
    duration: {
        type: Number,
        required: [true, 'Flight duration is required'],
        min: [0, 'Duration cannot be negative']
    },

    // Stops/Layovers
    stops: {
        type: Number,
        default: 0,
        min: [0, 'Stops cannot be negative']
    },
    layovers: [{
        airport: {
            code: String,
            name: String,
            city: String
        },
        duration: Number // in minutes
    }],

    // Pricing with Fare Classes
    pricing: {
        economy: {
            available: { type: Boolean, default: true },
            price: { type: Number, min: 0 },
            availableSeats: { type: Number, min: 0, default: 0 }
        },
        business: {
            available: { type: Boolean, default: false },
            price: { type: Number, min: 0 },
            availableSeats: { type: Number, min: 0, default: 0 }
        },
        firstClass: {
            available: { type: Boolean, default: false },
            price: { type: Number, min: 0 },
            availableSeats: { type: Number, min: 0, default: 0 }
        }
    },

    // Fare Class Details (for expandable cards)
    fareClasses: [{
        name: {
            type: String,
            enum: ['Economy Saver', 'Economy Flex', 'Business', 'First Class'],
            required: true
        },
        cabin: {
            type: String,
            enum: ['Economy', 'Business', 'First'],
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        features: {
            seatSelection: {
                included: { type: Boolean, default: false },
                fee: { type: Number, default: 0 }
            },
            carryOn: {
                included: { type: Boolean, default: true },
                weight: { type: Number, default: 7 } // kg
            },
            checkedBags: {
                count: { type: Number, default: 0 },
                weight: { type: Number, default: 0 }, // kg per bag
                fee: { type: Number, default: 0 } // per bag
            },
            cancellationFee: {
                type: Number,
                default: 0
            },
            changeFee: {
                type: Number,
                default: 0
            },
            refundable: {
                type: Boolean,
                default: false
            }
        },
        availableSeats: {
            type: Number,
            min: 0,
            default: 0
        }
    }],

    // Flight Status
    status: {
        type: String,
        enum: ['scheduled', 'delayed', 'cancelled', 'completed'],
        default: 'scheduled'
    },

    // Amenities
    amenities: [{
        type: String,
        enum: ['wifi', 'meals', 'entertainment', 'power-outlets', 'extra-legroom', 'priority-boarding']
    }],

    // Baggage Allowance
    baggage: {
        cabin: {
            weight: Number, // in kg
            pieces: Number
        },
        checked: {
            weight: Number, // in kg
            pieces: Number,
            included: { type: Boolean, default: true }
        }
    },

    // Additional Info
    refundable: {
        type: Boolean,
        default: false
    },

    featured: {
        type: Boolean,
        default: false
    },

    // Owner/Vendor
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
flightSchema.index({ 'departure.airport.code': 1 });
flightSchema.index({ 'arrival.airport.code': 1 });
flightSchema.index({ 'departure.airport.city': 1 });
flightSchema.index({ 'arrival.airport.city': 1 });
flightSchema.index({ 'departure.dateTime': 1 });
flightSchema.index({ airline: 1 });
flightSchema.index({ status: 1 });
flightSchema.index({ featured: 1 });

// Compound indexes for common queries
flightSchema.index({
    'departure.airport.code': 1,
    'arrival.airport.code': 1,
    'departure.dateTime': 1
});

// Virtual fields for time of day
flightSchema.virtual('departureTimeOfDay').get(function () {
    const hour = new Date(this.departure.dateTime).getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 21) return 'evening';
    return 'night';
});

flightSchema.virtual('arrivalTimeOfDay').get(function () {
    const hour = new Date(this.arrival.dateTime).getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 21) return 'evening';
    return 'night';
});

// Ensure virtuals are included in JSON
flightSchema.set('toJSON', { virtuals: true });
flightSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Flight', flightSchema);
