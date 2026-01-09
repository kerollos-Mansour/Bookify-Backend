const FlightBooking = require('../../../shared/models/flightBooking.model');
const Flight = require('../../../shared/models/flight.model');
const AppError = require('../../../shared/utils/appError.utils');
const httpStatusText = require('../../../shared/utils/httpStatusText');

class FlightBookingService {
    /**
     * Create a new flight booking
     */
    async createFlightBooking(bookingData, userId) {
        // Verify flight exists and has availability
        const flight = await Flight.findById(bookingData.flightId);

        if (!flight) {
            throw new AppError('Flight not found', 404, httpStatusText.FAIL);
        }

        if (flight.status !== 'scheduled') {
            throw new AppError('This flight is not available for booking', 400, httpStatusText.FAIL);
        }

        // Check availability for selected class
        const classOfService = bookingData.classOfService;
        const requiredSeats = bookingData.passengers.length;

        if (!flight.pricing[classOfService]?.available) {
            throw new AppError(`${classOfService} class is not available for this flight`, 400, httpStatusText.FAIL);
        }

        if (flight.pricing[classOfService].availableSeats < requiredSeats) {
            throw new AppError(`Not enough seats available in ${classOfService} class`, 400, httpStatusText.FAIL);
        }

        // Generate booking number
        const bookingNumber = `FB${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Generate PNR
        const pnr = `${flight.departure.airport.code}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Create booking
        const booking = await FlightBooking.create({
            ...bookingData,
            userId,
            bookingNumber,
            pnr
        });

        // Update available seats
        await Flight.findByIdAndUpdate(
            bookingData.flightId,
            {
                $inc: {
                    [`pricing.${classOfService}.availableSeats`]: -requiredSeats
                }
            }
        );

        return await FlightBooking.findById(booking._id)
            .populate('userId', 'firstName lastName email')
            .populate('flightId');
    }

    /**
     * Get all flight bookings with filters
     */
    async getAllFlightBookings(filters = {}, pagination = {}, user) {
        const query = {};

        // User filter
        if (user.role === 'user') {
            query.userId = user._id;
        } else if (filters.userId) {
            query.userId = filters.userId;
        }

        // Flight filter
        if (filters.flightId) {
            query.flightId = filters.flightId;
        }

        // Status filter
        if (filters.status) {
            query.status = filters.status;
        }

        // Payment status filter
        if (filters.paymentStatus) {
            query.paymentStatus = filters.paymentStatus;
        }

        // Date range filter
        if (filters.startDate || filters.endDate) {
            query.createdAt = {};
            if (filters.startDate) {
                query.createdAt.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.createdAt.$lte = new Date(filters.endDate);
            }
        }

        // Pagination
        const page = Number(pagination.page) || 1;
        const limit = Number(pagination.limit) || 10;
        const skip = (page - 1) * limit;

        // Get bookings
        const [bookings, total] = await Promise.all([
            FlightBooking.find(query)
                .populate('userId', 'firstName lastName email')
                .populate('flightId')
                .populate('couponId')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip),
            FlightBooking.countDocuments(query)
        ]);

        return {
            bookings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get booking by ID
     */
    async getFlightBookingById(bookingId, user) {
        const booking = await FlightBooking.findById(bookingId)
            .populate('userId', 'firstName lastName email')
            .populate('flightId')
            .populate('couponId');

        if (!booking) {
            throw new AppError('Booking not found', 404, httpStatusText.FAIL);
        }

        // Permission check
        if (user.role === 'user' && booking.userId._id.toString() !== user._id.toString()) {
            throw new AppError('You do not have permission to view this booking', 403, httpStatusText.FAIL);
        }

        return booking;
    }

    /**
     * Update booking status
     */
    async updateFlightBooking(bookingId, updateData, user) {
        const booking = await FlightBooking.findById(bookingId);

        if (!booking) {
            throw new AppError('Booking not found', 404, httpStatusText.FAIL);
        }

        // Permission check
        if (user.role === 'user' && booking.userId.toString() !== user._id.toString()) {
            throw new AppError('You do not have permission to update this booking', 403, httpStatusText.FAIL);
        }

        // Users can only cancel their bookings
        if (user.role === 'user' && updateData.status && updateData.status !== 'cancelled') {
            throw new AppError('You can only cancel your booking', 403, httpStatusText.FAIL);
        }

        // Handle cancellation
        if (updateData.status === 'cancelled' && booking.status !== 'cancelled') {
            updateData.cancelledAt = new Date();

            // Return seats to flight
            const flight = await Flight.findById(booking.flightId);
            if (flight) {
                await Flight.findByIdAndUpdate(
                    booking.flightId,
                    {
                        $inc: {
                            [`pricing.${booking.classOfService}.availableSeats`]: booking.passengers.length
                        }
                    }
                );
            }
        }

        const updatedBooking = await FlightBooking.findByIdAndUpdate(
            bookingId,
            updateData,
            { new: true, runValidators: true }
        )
            .populate('userId', 'firstName lastName email')
            .populate('flightId')
            .populate('couponId');

        return updatedBooking;
    }

    /**
     * Delete booking (admin only)
     */
    async deleteFlightBooking(bookingId, user) {
        if (user.role !== 'admin') {
            throw new AppError('Only admins can delete bookings', 403, httpStatusText.FAIL);
        }

        const booking = await FlightBooking.findById(bookingId);

        if (!booking) {
            throw new AppError('Booking not found', 404, httpStatusText.FAIL);
        }

        // Return seats if not already cancelled
        if (booking.status !== 'cancelled') {
            await Flight.findByIdAndUpdate(
                booking.flightId,
                {
                    $inc: {
                        [`pricing.${booking.classOfService}.availableSeats`]: booking.passengers.length
                    }
                }
            );
        }

        await FlightBooking.findByIdAndDelete(bookingId);
    }

    /**
     * Get user's flight bookings
     */
    async getUserFlightBookings(userId) {
        const bookings = await FlightBooking.find({ userId })
            .populate('flightId')
            .populate('couponId')
            .sort({ createdAt: -1 });

        return bookings;
    }
}

module.exports = new FlightBookingService();
