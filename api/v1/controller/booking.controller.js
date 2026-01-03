const bookingService = require("../../v1/services/booking.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");
const { sendNotificationToUser } = require("../../../sockets");

/**
 * Create a new booking
 * POST /api/v1/bookings
 * Protected route: user must be logged in
 */
exports.createBooking = catchAsync(async (req, res) => {
    const booking = await bookingService.createBooking({
        ...req.body,
        userId: req.user._id,
    });
  await sendNotificationToUser(req.user._id, {
    type: "booking",
    title: "Booking Confirmed",
    message: "Your booking has been successfully created!",
    data: { bookingId: booking._id },
  });
    res.status(201).json({
        status: httpStatusText.SUCCESS,
        message: "Booking created successfully",
        data: booking,
    });
});

/**
 * Get all bookings (Admin only)
 * GET /api/v1/bookings
 * Protected route: admin only
 * Query params: status, search, searchBy startDate
 */
exports.getAllBookings = catchAsync(async (req, res) => {
    const { status, search, startDate, searchBy } = req.query;
    const bookings = await bookingService.getAllBookings({
        status: status || undefined,
        search: search || undefined,
        startDate: startDate || undefined,
        searchBy: searchBy || undefined,
    });
    res.status(200).json({ status: httpStatusText.SUCCESS, data: bookings });
});

/**
 * Get all bookings of the logged-in user
 * GET /api/v1/bookings/my-bookings
 * Protected route: user must be logged in
 */
exports.getUserBookings = catchAsync(async (req, res) => {
    const bookings = await bookingService.getUserBookings(req.user);
    res.status(200).json({ status: httpStatusText.SUCCESS, data: bookings });
});

/**
 * Get a booking by ID
 * GET /api/v1/bookings/:id
 * Protected route: user must be logged in
 * Admin can access any booking
 */
exports.getBookingById = catchAsync(async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id);
    res.status(200).json({ status: httpStatusText.SUCCESS, data: booking });
});

/**
 * Update booking status (Admin only)
 * PUT /api/v1/bookings/:id/status
 * Protected route: admin only
 */
exports.updateBookingStatus = catchAsync(async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            status: httpStatusText.FAIL,
            message: "Status is required",
        });
    }

    const booking = await bookingService.updateBookingStatus(
        req.params.id,
        status
    );
    if (booking && booking.userId) {
    await sendNotificationToUser(booking.userId, {
      type: "update",
      title: "Booking Status Update",
      message: `Your booking status has been updated to ${booking.status}`,
      data: { bookingId: booking._id },
    });
  }
  res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "Booking status updated successfully",
        data: booking,
    });
});

/**
 * Cancel a booking
 * PUT /api/v1/bookings/:id/cancel
 * Protected route: user must be logged in
 * Users can cancel only their own bookings
 */
exports.cancelBooking = catchAsync(async (req, res) => {
    const booking = await bookingService.cancelBooking(req.user, req.params.id);
  
  await sendNotificationToUser(req.user._id, {
    type: "booking",
    title: "Booking Cancelled",
    message: "Your booking has been successfully cancelled.",
    data: { bookingId: booking._id },
  });
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "Booking cancelled",
        data: booking,
    });
});

/**
 * Update booking details
 * PUT /api/v1/bookings/:id
 * Protected route: user must be logged in
 * Users can update only their own bookings
 * Admin can update any booking
 */
exports.updateBooking = catchAsync(async (req, res) => {
    const booking = await bookingService.updateBooking(
        req.params.id,
        req.body,
        req.user._id,
        req.user.role === "admin"
    );
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "Booking updated successfully",
        data: booking,
    });
});
