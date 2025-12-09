const express = require('express');
const router = express.Router();

// Routes
const destinationRoutes = require('./routes/destinations.route');
const hotelRoutes = require('./routes/hotel.routes');
const bookingRoutes = require('./routes/booking.route');

// Mount route modules
router.use('/destinations', destinationRoutes);
router.use('/hotels', hotelRoutes);
router.use('/bookings', bookingRoutes);

module.exports = router;
