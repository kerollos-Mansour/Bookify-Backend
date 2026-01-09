const flightService = require('../services/flight.service');
const catchAsync = require('../../../shared/utils/catchError.utils');
const httpStatusText = require('../../../shared/utils/appError.utils');

/**
 * Create a new flight
 * POST /api/v1/flights
 */
const createFlight = catchAsync(async (req, res) => {
    const flight = await flightService.createFlight(req.body, req.user);

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { flight }
    });
});

/**
 * Get all flights with filtering, pagination, and sorting
 * GET /api/v1/flights?origin=JFK&destination=LAX&departureDate=2024-03-15&returnDate=2024-03-20&passengers=2&classOfService=economy&stops=direct&minPrice=200&maxPrice=800&airline=Delta&sort=price-asc&page=1&limit=10
 */
const getFlights = catchAsync(async (req, res) => {
    const {
        origin,
        destination,
        departureDate,
        returnDate,
        passengers,
        classOfService,
        stops,
        minPrice,
        maxPrice,
        airline,
        status,
        featured,
        ownerId
    } = req.query;

    const { page, limit } = req.query;
    const { sort } = req.query;

    const filters = {
        origin,
        destination,
        departureDate,
        returnDate,
        passengers: passengers ? Number(passengers) : undefined,
        classOfService,
        stops,
        minPrice,
        maxPrice,
        airline,
        status,
        featured,
        ownerId
    };

    const pagination = { page, limit };
    const sorting = { sort };

    const result = await flightService.getAllFlights(filters, pagination, sorting, req.user);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            flights: result.flights,
            page: result.pagination.page,
            totalPages: result.pagination.totalPages,
            totalFlights: result.pagination.total
        }
    });
});

/**
 * Get a single flight by ID
 * GET /api/v1/flights/:id
 */
const getFlightById = catchAsync(async (req, res) => {
    const flight = await flightService.getFlightById(req.params.id);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { flight }
    });
});

/**
 * Update a flight by ID
 * PUT /api/v1/flights/:id
 */
const updateFlight = catchAsync(async (req, res) => {
    const updatedFlight = await flightService.updateFlight(req.params.id, req.body, req.user);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { flight: updatedFlight }
    });
});

/**
 * Delete a flight by ID
 * DELETE /api/v1/flights/:id
 */
const deleteFlight = catchAsync(async (req, res) => {
    await flightService.deleteFlight(req.params.id, req.user);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: 'Flight deleted successfully'
    });
});

/**
 * Get popular routes
 * GET /api/v1/flights/popular-routes
 */
const getPopularRoutes = catchAsync(async (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const routes = await flightService.getPopularRoutes(limit);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { routes }
    });
});

/**
 * Get filter facets for dynamic filtering
 * GET /api/v1/flights/filter-facets?origin=JFK&destination=LAX&departureDate=2024-03-15
 */
const getFilterFacets = catchAsync(async (req, res) => {
    const {
        origin,
        destination,
        departureDate
    } = req.query;

    const filters = {
        origin,
        destination,
        departureDate
    };

    const facets = await flightService.getFilterFacets(filters);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { facets }
    });
});

module.exports = {
    createFlight,
    getFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
    getPopularRoutes,
    getFilterFacets
};
