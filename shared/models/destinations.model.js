const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Destination name is required'],
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String
    },
    // Category Reference (Nature, Adventure, Romantic, etc.)
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    // Pre-configured search parameters - THE KEY PART
    searchConfig: {
        // Location-based filters
        location: { type: String, trim: true },      // Free text search
        city: { type: String, trim: true },
        country: { type: String, trim: true },

        // Price range
        minRate: { type: Number, default: null },
        maxRate: { type: Number, default: null },

        // Hotel properties
        propertyCategory: { type: String },          // e.g., "luxury", "budget"
        minRating: { type: Number, min: 0, max: 5 },

        // Amenities filter (optional enhancement)
        amenities: [{ type: String }],

        // Default sorting for this destination
        defaultSort: {
            type: String,
            enum: ['rating', '-rating', 'price', '-price', 'popularity'],
            default: '-rating'
        },

        // Default pagination
        defaultLimit: {
            type: Number,
            default: 10
        }
    },

    // UI Display properties
    bestSeller: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    displayOrder: { type: Number, default: 0 },

    // Metadata
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Indexes
destinationSchema.index({ categoryId: 1, isActive: 1 });

destinationSchema.index({ bestSeller: 1, displayOrder: 1 });

module.exports = mongoose.model('Destination', destinationSchema);