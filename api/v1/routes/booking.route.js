const express = require("express");
const router = express.Router();
const bookingController = require("../controller/booking.controller");
const authMiddleware = require("../../../shared/middlewares/auth.middleware");

// Protected routes
router.post("/", authMiddleware.protect, bookingController.createBooking);
router.get(
  "/my-bookings",
  authMiddleware.protect,
  bookingController.getUserBookings
);
router.get("/:id", authMiddleware.protect, bookingController.getBookingById);
router.put(
  "/:id/cancel",
  authMiddleware.protect,
  bookingController.cancelBooking
);

// Admin routes
router.get(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictToAdmin,
  bookingController.getAllBookings
);
router.put(
  "/:id/status",
  authMiddleware.protect,
  authMiddleware.restrictToAdmin,
  bookingController.updateBookingStatus
);

module.exports = router;
