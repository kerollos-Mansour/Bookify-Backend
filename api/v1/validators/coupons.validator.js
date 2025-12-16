const Joi = require("joi");

// Create Coupons Schema
exports.createCouponsSchema = Joi.object({
    code: Joi.string().min(5).max(50).uppercase().trim().required().messages({
        "any.required": "Coupon code is required.",
        "string.min": "Coupon code must be at least 5 characters.",
        "string.max": "Coupon code cannot exceed 50 characters.",
    }),

    discountType: Joi.string()
        .required()
        .valid(
            "percentage",
            "fixed_amount",
            "free_night",
            "early_bird",
            "last_minute",
            "long_stay",
            "weekday_discount",
            "weekend_discount",
            "seasonal",
            "loyalty_tier",
            "bundle_discount"
        )
        .messages({
            "any.required": "Discount type is required.",
            "any.only":
                "Invalid discount type. Must be one of: percentage, fixed_amount, free_night, early_bird, last_minute, long_stay, weekday_discount, weekend_discount, seasonal, loyalty_tier, bundle_discount.",
        }),

    discountValue: Joi.number().required().min(0).messages({
        "any.required": "Discount value is required.",
        "number.min": "Discount value cannot be negative.",
    }),

    minPurchase: Joi.number().min(0).optional().default(0).messages({
        "number.min": "Minimum purchase amount cannot be negative.",
    }),

    maxDiscount: Joi.number().min(0).optional().messages({
        "number.min": "Maximum discount amount cannot be negative.",
    }),

    validForm: Joi.date().required().messages({
        "any.required": "Valid from date is required.",
        "date.base": "Valid from must be a valid date.",
    }),

    validTo: Joi.date().required().messages({
        "any.required": "Valid to date is required.",
        "date.base": "Valid to must be a valid date.",
    }),

    usedCount: Joi.number().min(1).optional().messages({
        "number.min": "Used count must be at least 1.",
    }),

    usageLimit: Joi.number().min(1).optional().messages({
        "number.min": "Usage limit must be at least 1.",
    }),

    isActive: Joi.boolean().optional().default(true).messages({
        "boolean.base": "Is active must be a boolean value.",
    }),

    applicableBooking: Joi.array()
        .items(
            Joi.string().alphanum().length(24).messages({
                "string.alphanum":
                    "Each booking ID must contain only alphanumeric characters.",
                "string.length": "Each booking ID must be 24 characters long.",
            })
        )
        .optional()
        .messages({
            "array.base": "Applicable bookings must be an array.",
        }),
});

// Update Coupons Schema
exports.updateCouponsSchema = Joi.object({
    code: Joi.string().min(5).max(50).uppercase().trim().optional().messages({
        "string.min": "Coupon code must be at least 5 characters.",
        "string.max": "Coupon code cannot exceed 50 characters.",
    }),

    discountType: Joi.string()
        .optional()
        .valid(
            "percentage",
            "fixed_amount",
            "free_night",
            "early_bird",
            "last_minute",
            "long_stay",
            "weekday_discount",
            "weekend_discount",
            "seasonal",
            "loyalty_tier",
            "bundle_discount"
        )
        .messages({
            "any.only": "Invalid discount type.",
        }),

    discountValue: Joi.number().min(0).optional().messages({
        "number.min": "Discount value cannot be negative.",
    }),

    minPurchase: Joi.number().min(0).optional().messages({
        "number.min": "Minimum purchase amount cannot be negative.",
    }),

    maxDiscount: Joi.number().min(0).optional().messages({
        "number.min": "Maximum discount amount cannot be negative.",
    }),

    validForm: Joi.date().optional().messages({
        "date.base": "Valid from must be a valid date.",
    }),

    validTo: Joi.date().optional().messages({
        "date.base": "Valid to must be a valid date.",
    }),

    usedCount: Joi.number().min(1).optional().messages({
        "number.min": "Used count must be at least 1.",
    }),

    usageLimit: Joi.number().min(1).optional().messages({
        "number.min": "Usage limit must be at least 1.",
    }),

    isActive: Joi.boolean().optional().messages({
        "boolean.base": "Is active must be a boolean value.",
    }),

    applicableBooking: Joi.array()
        .items(
            Joi.string().alphanum().length(24).messages({
                "string.alphanum":
                    "Each booking ID must contain only alphanumeric characters.",
                "string.length": "Each booking ID must be 24 characters long.",
            })
        )
        .optional()
        .messages({
            "array.base": "Applicable bookings must be an array.",
        }),
});

// Coupon ID Parameter Schema
exports.couponIdSchema = Joi.object({
    id: Joi.string().alphanum().length(24).required().messages({
        "any.required": "Coupon ID is required.",
        "string.alphanum":
            "Coupon ID must contain only alphanumeric characters.",
        "string.length": "Coupon ID must be 24 characters long.",
    }),
});

// Query Schema for filtering and pagination (GET /coupons)
exports.couponQuerySchema = Joi.object({
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
    sortBy: Joi.string().optional().default("createdAt").messages({
        "string.base": "Sort by must be a valid field name.",
    }),
    sortOrder: Joi.string()
        .valid("asc", "desc")
        .optional()
        .default("desc")
        .messages({
            "any.only": "Sort order must be either asc or desc.",
        }),
    isActive: Joi.boolean().optional().messages({
        "boolean.base": "Is active must be a boolean value.",
    }),
    discountType: Joi.string()
        .valid(
            "percentage",
            "fixed_amount",
            "free_night",
            "early_bird",
            "last_minute",
            "long_stay",
            "weekday_discount",
            "weekend_discount",
            "seasonal",
            "loyalty_tier",
            "bundle_discount"
        )
        .optional()
        .messages({
            "any.only": "Invalid discount type.",
        }),
    search: Joi.string().trim().optional().messages({
        "string.base": "Search term must be a valid text.",
    }),
});
