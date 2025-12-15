const Joi = require("joi");

exports.createAmenity = Joi.object({
    name: Joi.string().required().messages({
        "any.required": "name is required.",
    }),
    description: Joi.string().optional(),
    icon: Joi.string().optional(),
    category: Joi.string().valid("room", "hotel", "both").optional(),
});
exports.updateAmenity = Joi.object({
    name: Joi.string().optional().messages({
        "string.base": "Name must be a valid text.",
    }),
    description: Joi.string().optional(),
    icon: Joi.string().optional(),
    category: Joi.string().valid("room", "hotel", "both").optional(),
});

// Amenity ID Parameter Schema
exports.amenityIdSchema = Joi.object({
    id: Joi.string().alphanum().length(24).required().messages({
        "any.required": "Amenity ID is required.",
        "string.alphanum":
            "Amenity ID must contain only alphanumeric characters.",
        "string.length": "Amenity ID must be 24 characters long.",
    }),
});

// Query Schema for filtering and pagination (GET /amenities)
exports.amenityQuerySchema = Joi.object({
    category: Joi.string().valid("room", "hotel", "both").optional().messages({
        "any.only": "Category must be one of: room, hotel, both",
    }),
    search: Joi.string().trim().optional().messages({
        "string.base": "Search term must be a valid text.",
    }),
    page: Joi.number().integer().min(1).optional().default(1).messages({
        "number.base": "Page must be a number.",
        "number.min": "Page must be at least 1.",
    }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10)
        .messages({
            "number.base": "Limit must be a number.",
            "number.min": "Limit must be at least 1.",
            "number.max": "Limit cannot exceed 100.",
        }),
});
