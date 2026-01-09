const express = require('express');
const router = express.Router();
const flightBookingController = require('../controller/flightBooking.controller');
const { protect } = require('../../../shared/middlewares/jwt.middleware');
const { allowTo } = require('../../../shared/middlewares/jwt.middleware');

// All routes require authentication
router.use(protect);

// User routes
router.get('/user/me', flightBookingController.getMyFlightBookings);
router.post('/', flightBookingController.createFlightBooking);
router.get('/:id', flightBookingController.getFlightBookingById);
router.put('/:id', flightBookingController.updateFlightBooking);

// Admin routes
router.get('/', allowTo('admin', 'vendor'), flightBookingController.getFlightBookings);
router.delete('/:id', allowTo('admin'), flightBookingController.deleteFlightBooking);

module.exports = router;
