const express = require("express");
const router = express.Router();
const {
    createBooking,
    getBooking,
} = require("../controller/booking.controller");
const validate = require("../../../shared/middlewares/validate.middleware");
const { protect } = require("../../../shared/middlewares/jwt.middle");
const {
    createBookingSchema,
    bookingIdSchema,
} = require("../validators/booking.validator");

// Public routes
router.get("/", getBooking);
router.get("/:id", validate({ params: bookingIdSchema }), getBooking);

// Protected routes - User must be authenticated
router.post("/", protect, validate(createBookingSchema), createBooking);

module.exports = router;
