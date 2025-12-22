const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const priceSchema = new Schema({
    original: {
        type: Number,
        required: true,
    },
    discounted: {
        type: Number,
        required: false,
        default: 0,
    },
    discount: {
        type: Number,
        default: 0,
    },
    currency: {
        type: String,
        default: "USD",
        enum: ["USD", "EUR", "GBP", "CAD", "AUD"],
    },
});

const refundableSchema = new Schema({
    isRefundable: {
        type: Boolean,
        default: false,
    },
    deadline: {
        type: Date,
    },
});

const roomSchema = new Schema(
    {
        hotelId: {
            type: Schema.Types.ObjectId,
            ref: "Hotel",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        images: [String],
        amenities: [
            {
                type: Schema.Types.ObjectId,
                ref: "Amenity",
            },
        ],
        size: {
            type: String,
            trim: true,
        },
        sleeps: {
            type: Number,
            required: true,
            min: 1,
        },
        bedType: {
            type: String,
            enum: ["single", "double", "queen", "king", "twin", "full"],
            default: "single",
        },
        allInclusive: {
            type: Boolean,
            default: false,
        },
        bedrooms: {
            type: Number,
            min: 1,
            default: 1,
        },
        status: {
            type: String,
            enum: ["available", "occupied", "maintenance"],
            default: "available",
        },
        refundable: {
            type: refundableSchema,
            default: {},
        },
        price: {
            type: priceSchema
            // required: true,
        },
        quantity: {
            type: Number,
            min: 1,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

// Add indexes for better query performance
roomSchema.index({ hotelId: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ "price.original": 1 });

module.exports = mongoose.model("Room", roomSchema);
