const Joi = require("joi");

exports.createBookingSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": "User Id is required.",
    }),
    hotelId: Joi.string().required().messages({
        "any.required": "Hotel Id is required.",
    }),
    roomId: Joi.string().required().messages({
        "any.required": "Room Id is required.",
    }),
    checkIn: Joi.date().required().messages({
        "any.required": "check in is required.",
    }),
    checkOut: Joi.date().required().messages({
        "any.required": "check out is required.",
    }),
    nights: Joi.number().required().min(1).messages({
        "any.required": "nights is required.",
    }),
    subtotal: Joi.number().required().min(0).messages({
        "any.required": "subtotal is required.",
    }),
    pricePerNight: Joi.number().required().min(0).messages({
        "any.required": "price per night is required.",
    }),
    totalPrice: Joi.number().required().messages({
        "any.required": "total price is required.",
    }),
    guests: Joi.number().required().max(10).messages({
        "any.required": "total price is required.",
    }),
    currency: Joi.string().required().messages({
        "any.required": "currency per night is required.",
    }),
    status: Joi.string()
        .required()
        .valid("pending", "confirmed", "cancelled", "completed", "no-show")
        .messages({
            "any.required": "total price is required.",
        }),
    bookingNumber: Joi.number().required().messages({
        "any.required": "booking number per night is required.",
    }),
});

exports.updateBooking = Joi.object({
    userId: Joi.string().optional().messages({
        "string.base": "User Id must be a valid string.",
    }),
    hotelId: Joi.string().optional().messages({
        "string.base": "Hotel Id must be a valid string.",
    }),
    roomId: Joi.string().optional().messages({
        "string.base": "Room Id must be a valid string.",
    }),
    checkIn: Joi.date().optional().messages({
        "date.base": "Check in must be a valid date.",
    }),
    checkOut: Joi.date().optional().messages({
        "date.base": "Check out must be a valid date.",
    }),
    nights: Joi.number().min(1).optional().messages({
        "number.base": "Nights must be a number.",
    }),
    subtotal: Joi.number().min(0).optional().messages({
        "number.base": "Subtotal must be a number.",
    }),
    pricePerNight: Joi.number().min(0).optional().messages({
        "number.base": "Price per night must be a number.",
    }),
    totalPrice: Joi.number().optional().messages({
        "number.base": "Total price must be a number.",
    }),
    guests: Joi.number().max(10).optional().messages({
        "number.base": "Guests must be a number.",
    }),
    currency: Joi.string().optional().messages({
        "string.base": "Currency must be a valid string.",
    }),
    status: Joi.string()
        .optional()
        .valid("pending", "confirmed", "cancelled", "completed", "no-show")
        .messages({
            "any.only": "Invalid booking status.",
        }),
    bookingNumber: Joi.number().optional().messages({
        "number.base": "Booking number must be a number.",
    }),
});

// Booking ID Parameter Schema
exports.bookingIdSchema = Joi.object({
    id: Joi.string().alphanum().length(24).required().messages({
        "any.required": "Booking ID is required.",
        "string.alphanum":
            "Booking ID must contain only alphanumeric characters.",
        "string.length": "Booking ID must be 24 characters long.",
    }),
});
