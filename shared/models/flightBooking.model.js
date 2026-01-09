const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['adult', 'child', 'infant'],
        required: true
    },
    title: {
        type: String,
        enum: ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr'],
        required: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    passportNumber: {
        type: String,
        trim: true
    },
    nationality: {
        type: String,
        trim: true
    }
});

const flightBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    },
    flightId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: [true, 'Flight ID is required'],
        index: true
    },

    // Booking Details
    bookingNumber: {
        type: String,
        required: [true, 'Booking number is required'],
        unique: true,
        index: true
    },
    pnr: {
        type: String, // Passenger Name Record
        unique: true,
        sparse: true
    },

    // Passengers
    passengers: {
        type: [passengerSchema],
        validate: {
            validator: function (passengers) {
                return passengers && passengers.length > 0;
            },
            message: 'At least one passenger is required'
        }
    },

    // Class of Service
    classOfService: {
        type: String,
        enum: ['economy', 'business', 'firstClass'],
        required: true
    },

    // Seat Selection
    seats: [{
        passengerId: mongoose.Schema.Types.ObjectId,
        seatNumber: String
    }],

    // Pricing
    basePrice: {
        type: Number,
        required: true,
        min: 0
    },
    taxes: {
        type: Number,
        default: 0,
        min: 0
    },
    fees: {
        type: Number,
        default: 0,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },

    // Add-ons
    extraBaggage: {
        pieces: { type: Number, default: 0 },
        cost: { type: Number, default: 0 }
    },
    mealPreferences: [{
        passengerId: mongoose.Schema.Types.ObjectId,
        preference: {
            type: String,
            enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'glutenFree', 'none']
        }
    }],
    specialRequests: {
        type: String,
        trim: true
    },

    // Booking Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'checked-in'],
        default: 'pending',
        index: true
    },

    // Payment Information
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'pending', 'paid', 'refunded', 'failed'],
        default: 'pending',
        index: true
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'paypal', 'cash', 'other'],
        required: true
    },
    paymentIntentId: {
        type: String
    },

    // Coupon
    couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupons',
        default: null
    },

    // Contact Information
    contactEmail: {
        type: String,
        required: true,
        trim: true
    },
    contactPhone: {
        type: String,
        required: true,
        trim: true
    },

    // Cancellation
    cancellationReason: {
        type: String,
        trim: true
    },
    cancelledAt: {
        type: Date
    },
    refundAmount: {
        type: Number,
        min: 0
    }
}, {
    timestamps: true
});

// Indexes for better query performance
flightBookingSchema.index({ userId: 1 });
flightBookingSchema.index({ flightId: 1 });
flightBookingSchema.index({ status: 1 });
flightBookingSchema.index({ paymentStatus: 1 });
flightBookingSchema.index({ bookingNumber: 1 });
flightBookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FlightBooking', flightBookingSchema);
