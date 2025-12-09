const express = require('express');
const router = express.Router();

// Routes
const destinationRoutes = require('./routes/destinations.route');
const hotelRoutes = require('./routes/hotel.route');
const bookingRoutes = require('./routes/booking.route');
const userRoutes = require('./routes/user.route');

// Mount route modules
router.use('/destinations', destinationRoutes);
router.use('/hotels', hotelRoutes);
router.use('/bookings', bookingRoutes);
router.use('/users', userRoutes);

module.exports = router;
