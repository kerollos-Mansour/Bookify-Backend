const Joi = require("joi");

// Create Destination Schema
// Create Destination Schema
exports.createDestinationSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        "any.required": "Destination name is required.",
        "string.base": "Destination name must be a valid text.",
    }),

    description: Joi.string().trim().optional().messages({
        "string.base": "Description must be a valid text.",
    }),

    image: Joi.string().uri().allow(null, '').optional().messages({
        "string.uri": "Image must be a valid URL.",
    }),

    categoryId: Joi.string().alphanum().length(24).required().messages({
        "any.required": "Category ID is required.",
        "string.base": "Category ID must be a valid string.",
        "string.length": "Category ID must be a valid 24-character Object ID.",
    }),

    searchConfig: Joi.object({
        location: Joi.string().trim().optional(),
        city: Joi.string().trim().optional(),
        country: Joi.string().trim().optional(),
        minRate: Joi.number().optional(),
        maxRate: Joi.number().optional(),
        propertyCategory: Joi.string().optional(),
        defaultSort: Joi.string().valid('rating', '-rating', 'price', '-price').default('-rating')
    }).optional(),

    bestSeller: Joi.boolean().optional().default(false).messages({
        "boolean.base": "Best seller must be a boolean value.",
    }),

    rating: Joi.number().min(0).max(5).optional().messages({
        "number.base": "Rating must be a valid number.",
        "number.min": "Rating cannot be negative.",
        "number.max": "Rating cannot exceed 5.",
    }),

    displayOrder: Joi.number().optional().default(0),
});

// Update Destination Schema
exports.updateDestinationSchema = Joi.object({
    name: Joi.string().trim().optional().messages({
        "string.base": "Destination name must be a valid text.",
    }),

    description: Joi.string().trim().optional().messages({
        "string.base": "Description must be a valid text.",
    }),

    image: Joi.string().uri().allow(null, '').optional().messages({
        "string.uri": "Image must be a valid URL.",
    }),

    categoryId: Joi.string().alphanum().length(24).optional().messages({
        "string.base": "Category ID must be a valid string.",
        "string.length": "Category ID must be a valid 24-character Object ID.",
    }),

    searchConfig: Joi.object({
        location: Joi.string().trim().optional(),
        city: Joi.string().trim().optional(),
        country: Joi.string().trim().optional(),
        minRate: Joi.number().optional(),
        maxRate: Joi.number().optional(),
        propertyCategory: Joi.string().optional(),
        defaultSort: Joi.string().valid('rating', '-rating', 'price', '-price')
    }).optional(),

    bestSeller: Joi.boolean().optional().messages({
        "boolean.base": "Best seller must be a boolean value.",
    }),

    rating: Joi.number().min(0).max(5).optional().messages({
        "number.base": "Rating must be a valid number.",
        "number.min": "Rating cannot be negative.",
        "number.max": "Rating cannot exceed 5.",
    }),

    displayOrder: Joi.number().optional(),
});

// Destination ID Parameter Schema
exports.destinationIdSchema = Joi.object({
    id: Joi.string().alphanum().length(24).required().messages({
        "any.required": "Destination ID is required.",
        "string.alphanum":
            "Destination ID must contain only alphanumeric characters.",
        "string.length": "Destination ID must be 24 characters long.",
    }),
});

// Query Schema for filtering destinations
exports.destinationQuerySchema = Joi.object({
    bestSeller: Joi.boolean().optional().messages({
        "boolean.base": "Best seller must be a boolean value.",
    }),
    categoryId: Joi.string().optional().messages({
        "string.base": "Category ID must be a valid string.",
    }),
    minRating: Joi.number().min(0).max(5).optional().messages({
        "number.min": "Minimum rating cannot be negative.",
        "number.max": "Minimum rating cannot exceed 5.",
    }),
    page: Joi.number().integer().min(1).default(1).messages({
        "number.base": "Page must be a number.",
        "number.min": "Page must be at least 1.",
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
        "number.max": "Limit cannot exceed 100 items.",
        "number.min": "Limit must be at least 1.",
    }),
});
