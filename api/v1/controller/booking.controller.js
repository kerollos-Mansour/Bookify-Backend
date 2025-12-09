const bookingService = require("../services/booking.service");
const catchAsync = require("../../../shared/utils/catchError.utils");

/**
 * Create a new booking
 * POST /api/v1/bookings
 */
exports.createBooking = catchAsync(async (req, res, next) => {
  const result = await bookingService.createBooking(req.body);

  res.status(201).json({
    success: true,
    message: "Booking created successfully",
    data: result.metadata
  });
});

/**
 * Get all bookings
 * GET /api/v1/bookings
 */
exports.getBooking = catchAsync(async (req, res, next) => {
  const bookings = await bookingService.getAllBookings();

  res.status(200).json({
    success: true,
    data: bookings
  });
});

/**
 * Get a single booking by ID
 * GET /api/v1/bookings/:id
 */
exports.getBookingId = catchAsync(async (req, res, next) => {
  const booking = await bookingService.getBookingById(req.params.id);

  res.status(200).json({
    success: true,
    data: booking
  });
});

/**
 * Cancel a booking by ID
 * POST /api/v1/bookings/:id/cancel
 */
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await bookingService.cancelBooking(req.params.id);

  res.status(200).json({
    success: true,
    message: "Booking cancelled successfully",
    data: booking
  });
});