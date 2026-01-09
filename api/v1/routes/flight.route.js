const express = require('express');
const router = express.Router();
const flightController = require('../controller/flight.controller');
const { protect } = require('../../../shared/middlewares/jwt.middleware');
const { allowTo } = require('../../../shared/middlewares/jwt.middleware');



// Public routes
router.get('/popular-routes', flightController.getPopularRoutes);
router.get('/filter-facets', flightController.getFilterFacets);
router.get('/', flightController.getFlights);
router.get('/:id', flightController.getFlightById);

// Protected routes - Admin and Vendor only
router.post(
    '/',
    protect,
    allowTo('admin', 'vendor'),
    flightController.createFlight
);

router.put(
    '/:id',
    protect,
    allowTo('admin', 'vendor'),
    flightController.updateFlight
);

router.delete(
    '/:id',
    protect,
    allowTo('admin', 'vendor'),
    flightController.deleteFlight
);

module.exports = router;
