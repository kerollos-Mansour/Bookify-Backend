const Joi = require("joi");

exports.createUserSchema = Joi.object({
    username: Joi.string().max(50).required().messages({
        "string.base": "Username must be a valid text.",
        "string.max": "Username cannot exceed 50 characters.",
        "any.required": "Username is required.",
    }),

    email: Joi.string().email().max(255).required().messages({
        "string.email": "Email must be a valid email address.",
        "any.required": "Email is required.",
        "string.max": "Email cannot exceed 255 characters.",
    }),

    password: Joi.string().min(6).max(255).required().messages({
        "string.min": "Password must be at least 6 characters.",
        "string.max": "Password cannot exceed 255 characters.",
        "any.required": "Password is required.",
    }),
    role: Joi.string().valid("user", "admin").optional().default("user"),
    name: Joi.string().max(100).optional().messages({
        "string.max": "Name cannot exceed 100 characters.",
    }),

    phoneNo: Joi.string().max(20).optional().messages({
        "string.max": "Phone number cannot exceed 20 characters.",
    }),

    country: Joi.string().max(100).optional().messages({
        "string.max": "Country cannot exceed 100 characters.",
    }),

    dateOfBirth: Joi.date().optional().messages({
        "date.base": "Date of birth must be a valid date.",
    }),

    gender: Joi.string().max(20).optional().messages({
        "string.max": "Gender cannot exceed 20 characters.",
    }),

    bio: Joi.string().optional().messages({
        "string.base": "Bio must be a text.",
    }),

    address: Joi.string().max(255).optional().messages({
        "string.max": "Address cannot exceed 255 characters.",
    }),

    emergencyContact: Joi.string().max(100).optional().messages({
        "string.max": "Emergency contact cannot exceed 100 characters.",
    }),

    accessibilityNeeds: Joi.string().optional().messages({
        "string.base": "Accessibility needs must be text.",
    }),
});

exports.updateUserSchema = exports.createUserSchema.fork(
    Object.keys(exports.createUserSchema.describe().keys),
    (schema) => schema.optional()
);
// User ID Parameter Schema
exports.userIdSchema = Joi.object({
    id: Joi.string().alphanum().length(24).required().messages({
        "any.required": "User ID is required.",
        "string.alphanum": "User ID must contain only alphanumeric characters.",
        "string.length": "User ID must be 24 characters long.",
    }),
});

// Change User Role Schema
exports.changeUserRoleSchema = Joi.object({
    role: Joi.string().valid("user", "admin").required().messages({
        "any.required": "Role is required.",
        "any.only": "Role must be either 'user' or 'admin'.",
    }),
});
