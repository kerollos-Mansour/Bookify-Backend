const flightBookingService = require('../services/flightBooking.service');
const catchAsync = require('../../../shared/utils/catchError.utils');
const httpStatusText = require('../../../shared/utils/appError.utils');

/**
 * Create a new flight booking
 * POST /api/v1/flight-bookings
 */
const createFlightBooking = catchAsync(async (req, res) => {
    const booking = await flightBookingService.createFlightBooking(req.body, req.user._id);

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { booking }
    });
});

/**
 * Get all flight bookings with filtering and pagination
 * GET /api/v1/flight-bookings?userId=xxx&flightId=xxx&status=confirmed&paymentStatus=paid&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10
 */
const getFlightBookings = catchAsync(async (req, res) => {
    const {
        userId,
        flightId,
        status,
        paymentStatus,
        startDate,
        endDate
    } = req.query;

    const { page, limit } = req.query;

    const filters = {
        userId,
        flightId,
        status,
        paymentStatus,
        startDate,
        endDate
    };

    const pagination = { page, limit };

    const result = await flightBookingService.getAllFlightBookings(filters, pagination, req.user);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            bookings: result.bookings,
            page: result.pagination.page,
            totalPages: result.pagination.totalPages,
            totalBookings: result.pagination.total
        }
    });
});

/**
 * Get a single flight booking by ID
 * GET /api/v1/flight-bookings/:id
 */
const getFlightBookingById = catchAsync(async (req, res) => {
    const booking = await flightBookingService.getFlightBookingById(req.params.id, req.user);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { booking }
    });
});

/**
 * Update a flight booking
 * PUT /api/v1/flight-bookings/:id
 */
const updateFlightBooking = catchAsync(async (req, res) => {
    const updatedBooking = await flightBookingService.updateFlightBooking(
        req.params.id,
        req.body,
        req.user
    );

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { booking: updatedBooking }
    });
});

/**
 * Delete a flight booking (admin only)
 * DELETE /api/v1/flight-bookings/:id
 */
const deleteFlightBooking = catchAsync(async (req, res) => {
    await flightBookingService.deleteFlightBooking(req.params.id, req.user);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: 'Flight booking deleted successfully'
    });
});

/**
 * Get user's flight bookings
 * GET /api/v1/flight-bookings/user/me
 */
const getMyFlightBookings = catchAsync(async (req, res) => {
    const bookings = await flightBookingService.getUserFlightBookings(req.user._id);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { bookings }
    });
});

module.exports = {
    createFlightBooking,
    getFlightBookings,
    getFlightBookingById,
    updateFlightBooking,
    deleteFlightBooking,
    getMyFlightBookings
};
