const Joi = require("joi");

// Nested location schema
const locationSchema = Joi.object({
    address: Joi.string().trim().optional().messages({
        "string.base": "Address must be a valid text.",
    }),
    city: Joi.string().trim().optional().messages({
        "string.base": "City must be a valid text.",
    }),
    stateProvinceCode: Joi.string().trim().optional().messages({
        "string.base": "State/Province code must be a valid text.",
    }),
    countryCode: Joi.string().trim().optional().messages({
        "string.base": "Country code must be a valid text.",
    }),
    latitude: Joi.number().min(-90).max(90).optional().messages({
        "number.base": "Latitude must be a valid number.",
        "number.min": "Latitude must be between -90 and 90.",
        "number.max": "Latitude must be between -90 and 90.",
    }),
    longitude: Joi.number().min(-180).max(180).optional().messages({
        "number.base": "Longitude must be a valid number.",
        "number.min": "Longitude must be between -180 and 180.",
        "number.max": "Longitude must be between -180 and 180.",
    }),
});

// Create Hotel Schema
exports.createHotelSchema = Joi.object({
    name: Joi.string().trim().required().messages({
        "any.required": "Hotel name is required.",
        "string.base": "Hotel name must be a valid text.",
    }),
    type: Joi.string().trim().optional().messages({
        "string.base": "Hotel type must be a valid text.",
    }),
    images: Joi.array()
        .items(
            Joi.string().uri().messages({
                "string.uri": "Each image must be a valid URL.",
            })
        )
        .optional()
        .messages({
            "array.base": "Images must be an array.",
        }),
    tripAdvisorRating: Joi.number().min(0).max(5).optional().messages({
        "number.base": "TripAdvisor rating must be a valid number.",
        "number.min": "TripAdvisor rating cannot be negative.",
        "number.max": "TripAdvisor rating cannot exceed 5.",
    }),
    hotelRating: Joi.number().min(0).max(5).optional().messages({
        "number.base": "Hotel rating must be a valid number.",
        "number.min": "Hotel rating cannot be negative.",
        "number.max": "Hotel rating cannot exceed 5.",
    }),
    propertyCategory: Joi.string().trim().optional().messages({
        "string.base": "Property category must be a valid text.",
    }),
    confidenceRating: Joi.number().min(0).optional().messages({
        "number.base": "Confidence rating must be a valid number.",
        "number.min": "Confidence rating cannot be negative.",
    }),
    lowRate: Joi.number().min(0).optional().messages({
        "number.base": "Low rate must be a valid number.",
        "number.min": "Low rate cannot be negative.",
    }),
    highRate: Joi.number().min(0).optional().messages({
        "number.base": "High rate must be a valid number.",
        "number.min": "High rate cannot be negative.",
    }),
    location: locationSchema.optional().messages({
        "object.base": "Location must be a valid object.",
    }),
});

// Update Hotel Schema
exports.updateHotelSchema = Joi.object({
    name: Joi.string().trim().optional().messages({
        "string.base": "Hotel name must be a valid text.",
    }),
    type: Joi.string().trim().optional().messages({
        "string.base": "Hotel type must be a valid text.",
    }),
    images: Joi.array()
        .items(
            Joi.string().uri().messages({
                "string.uri": "Each image must be a valid URL.",
            })
        )
        .optional()
        .messages({
            "array.base": "Images must be an array.",
        }),
    tripAdvisorRating: Joi.number().min(0).max(5).optional().messages({
        "number.base": "TripAdvisor rating must be a valid number.",
        "number.min": "TripAdvisor rating cannot be negative.",
        "number.max": "TripAdvisor rating cannot exceed 5.",
    }),
    hotelRating: Joi.number().min(0).max(5).optional().messages({
        "number.base": "Hotel rating must be a valid number.",
        "number.min": "Hotel rating cannot be negative.",
        "number.max": "Hotel rating cannot exceed 5.",
    }),
    propertyCategory: Joi.string().trim().optional().messages({
        "string.base": "Property category must be a valid text.",
    }),
    confidenceRating: Joi.number().min(0).optional().messages({
        "number.base": "Confidence rating must be a valid number.",
        "number.min": "Confidence rating cannot be negative.",
    }),
    lowRate: Joi.number().min(0).optional().messages({
        "number.base": "Low rate must be a valid number.",
        "number.min": "Low rate cannot be negative.",
    }),
    highRate: Joi.number().min(0).optional().messages({
        "number.base": "High rate must be a valid number.",
        "number.min": "High rate cannot be negative.",
    }),
    location: locationSchema.optional().messages({
        "object.base": "Location must be a valid object.",
    }),
});

// ID Parameter Schema (for routes like /hotels/:id)
exports.hotelIdSchema = Joi.object({
    id: Joi.string().alphanum().length(24).required().messages({
        "any.required": "Hotel ID is required.",
        "string.alphanum":
            "Hotel ID must contain only alphanumeric characters.",
        "string.length": "Hotel ID must be 24 characters long.",
    }),
});

// Query Schema for filtering and pagination (GET /hotels)
exports.hotelQuerySchema = Joi.object({
    city: Joi.string().trim().optional().messages({
        "string.base": "City must be a valid text.",
    }),
    country: Joi.string().trim().optional().messages({
        "string.base": "Country must be a valid text.",
    }),
    minRate: Joi.number().min(0).optional().messages({
        "number.base": "Minimum rate must be a valid number.",
        "number.min": "Minimum rate cannot be negative.",
    }),
    maxRate: Joi.number().min(0).optional().messages({
        "number.base": "Maximum rate must be a valid number.",
        "number.min": "Maximum rate cannot be negative.",
    }),
    propertyCategory: Joi.string().trim().optional().messages({
        "string.base": "Property category must be a valid text.",
    }),
    search: Joi.string().trim().optional().messages({
        "string.base": "Search term must be a valid text.",
    }),
    sort: Joi.string().trim().optional().messages({
        "string.base": "Sort parameter must be a valid text.",
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
