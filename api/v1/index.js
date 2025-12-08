const express = require('express');
const router = express.Router();

// Routes
const destinationRoutes = require('./routes/destinations.route');
const hotelRoutes = require('./routes/hotel.routes');

// Mount route modules
router.use('/destinations', destinationRoutes);
router.use('/hotels', hotelRoutes);

module.exports = router;
