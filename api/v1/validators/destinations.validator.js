const Joi = require("joi");

// Create Destination Schema
exports.createDestinationSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        "any.required": "Destination name is required.",
        "string.base": "Destination name must be a valid text.",
    }),

    location: Joi.string().trim().required().messages({
        "any.required": "Location is required.",
        "string.base": "Location must be a valid text.",
    }),

    price: Joi.string().required().messages({
        "any.required": "Price is required.",
        "string.base": "Price must be a valid string.",
    }),

    image: Joi.string().uri().optional().messages({
        "string.uri": "Image must be a valid URL.",
    }),

    categoryId: Joi.string().optional().messages({
        "string.base": "Category ID must be a valid string.",
    }),

    bestSeller: Joi.boolean().optional().default(false).messages({
        "boolean.base": "Best seller must be a boolean value.",
    }),

    rating: Joi.number().min(0).max(5).optional().messages({
        "number.base": "Rating must be a valid number.",
        "number.min": "Rating cannot be negative.",
        "number.max": "Rating cannot exceed 5.",
    }),

    address: Joi.string().trim().optional().messages({
        "string.base": "Address must be a valid text.",
    }),
});

// Update Destination Schema
exports.updateDestinationSchema = Joi.object({
    name: Joi.string().trim().optional().messages({
        "string.base": "Destination name must be a valid text.",
    }),

    location: Joi.string().trim().optional().messages({
        "string.base": "Location must be a valid text.",
    }),

    price: Joi.string().optional().messages({
        "string.base": "Price must be a valid string.",
    }),

    image: Joi.string().uri().optional().messages({
        "string.uri": "Image must be a valid URL.",
    }),

    categoryId: Joi.string().optional().messages({
        "string.base": "Category ID must be a valid string.",
    }),

    bestSeller: Joi.boolean().optional().messages({
        "boolean.base": "Best seller must be a boolean value.",
    }),

    rating: Joi.number().min(0).max(5).optional().messages({
        "number.base": "Rating must be a valid number.",
        "number.min": "Rating cannot be negative.",
        "number.max": "Rating cannot exceed 5.",
    }),

    address: Joi.string().trim().optional().messages({
        "string.base": "Address must be a valid text.",
    }),
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
