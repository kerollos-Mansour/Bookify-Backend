const Joi = require("joi");

// -----------------------
// Nested Schemas
// -----------------------

const priceSchema = Joi.object({
    original: Joi.number().positive().required().messages({
        "number.base": "Original price must be a number.",
        "number.positive": "Original price must be greater than 0.",
        "any.required": "Original price is required.",
    }),

    discounted: Joi.number().min(0).optional().messages({
        "number.base": "Discounted price must be a number.",
        "number.min": "Discounted price cannot be negative.",
    }),

    discount: Joi.number().min(0).max(100).optional().messages({
        "number.base": "Discount must be a valid number.",
        "number.min": "Discount cannot be less than 0%.",
        "number.max": "Discount cannot exceed 100%.",
    }),

    currency: Joi.string().valid("USD", "EUR", "GBP", "CAD", "AUD").messages({
        "any.only": "Currency must be one of: USD, EUR, GBP, CAD, AUD.",
    }),
});

const refundableSchema = Joi.object({
    isRefundable: Joi.boolean().default(false),

    deadline: Joi.date().optional().messages({
        "date.base": "Refund deadline must be a valid date.",
    }),
});

// -----------------------
// Create Room Schema
// -----------------------
exports.createRoomSchema = Joi.object({
    hotelId: Joi.string().required().messages({
        "any.required": "Hotel ID is required.",
        "string.base": "Hotel ID must be a valid string.",
    }),

    name: Joi.string().trim().required().messages({
        "any.required": "Room name is required.",
        "string.base": "Room name must be text.",
    }),

    images: Joi.array().items(
        Joi.string().uri().messages({
            "string.uri": "Each image must be a valid URL.",
        })
    ),

    amenities: Joi.array().items(
        Joi.string().messages({
            "string.base": "Amenity ID must be a valid string.",
        })
    ),

    size: Joi.string().optional().messages({
        "string.base": "Size must be a string.",
    }),

    sleeps: Joi.number().min(1).required().messages({
        "any.required": "Sleeps capacity is required.",
        "number.base": "Sleeps must be a number.",
        "number.min": "Room must accommodate at least 1 person.",
    }),

    bedType: Joi.string()
        .valid("single", "double", "queen", "king", "twin", "full")
        .optional()
        .messages({
            "any.only": "Invalid bed type.",
        }),

    allInclusive: Joi.boolean().optional(),

    bedrooms: Joi.number().min(1).default(1).messages({
        "number.base": "Bedrooms must be a numeric value.",
        "number.min": "Bedrooms cannot be less than 1.",
    }),

    status: Joi.string()
        .valid("available", "occupied", "maintenance")
        .optional()
        .messages({
            "any.only": "Status must be: available, occupied, maintenance.",
        }),

    refundable: refundableSchema,

    price: priceSchema.required().messages({
        "any.required": "Price information is required.",
    }),

    quantity: Joi.number().min(1).default(1).messages({
        "number.base": "Quantity must be a number.",
        "number.min": "Quantity must be at least 1.",
    }),
});

// Update Schema
exports.updateRoomSchema = exports.createRoomSchema.fork(
    Object.keys(exports.createRoomSchema.describe().keys),
    (schema) => schema.optional()
);

// Room ID Parameter Schema
exports.roomIdSchema = Joi.object({
    roomId: Joi.string().alphanum().length(24).required().messages({
        "any.required": "Room ID is required.",
        "string.alphanum": "Room ID must contain only alphanumeric characters.",
        "string.length": "Room ID must be 24 characters long.",
    }),
});

// Filters Schema
exports.roomPathSchema = Joi.object({
    status: Joi.string()
        .valid("available", "occupied", "maintenance")
        .optional(),
});

exports.roomQuerySchema = Joi.object({
    minPrice: Joi.number().min(0).optional(),

    maxPrice: Joi.number().min(0).optional(),

    page: Joi.number().integer().min(1).default(1).messages({
        "number.base": "Page must be a number.",
        "number.min": "Page must be at least 1.",
    }),

    limit: Joi.number().integer().min(1).max(100).default(10).messages({
        "number.max": "Limit cannot exceed 100 items.",
        "number.min": "Limit must be at least 1.",
    }),
});
