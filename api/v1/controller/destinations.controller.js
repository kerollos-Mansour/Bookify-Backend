const destinationService = require("../services/destinations.service");
const catchAsync = require("../../../shared/utils/catchError.utils");

/**
 * Create a new destination
 * POST /api/v1/destinations
 */
exports.createDestination = catchAsync(async (req, res) => {
    const destination = await destinationService.createDestination(req.body);

    res.status(201).json({
        status: "success",
        data: destination
    });
});

/**
 * Get all destinations with optional filtering and pagination
 * GET /api/v1/destinations?categoryId=123&page=1&limit=10
 */
exports.getAllDestinations = catchAsync(async (req, res) => {
    const { categoryId, page, limit } = req.query;

    const filters = { categoryId };
    const pagination = { page, limit };

    const result = await destinationService.getAllDestinations(filters, pagination);

    res.status(200).json({
        status: "success",
        data: result.destinations,
        pagination: result.pagination
    });
});

/**
 * Get a single destination by ID
 * GET /api/v1/destinations/:id
 */
exports.getDestinationById = catchAsync(async (req, res, next) => {
    const destination = await destinationService.getDestinationById(req.params.id);

    res.status(200).json({
        status: "success",
        data: destination
    });
});

/**
 * Update a destination by ID
 * PUT /api/v1/destinations/:id
 */
exports.updateDestination = catchAsync(async (req, res, next) => {
    const updatedDestination = await destinationService.updateDestination(
        req.params.id,
        req.body
    );

    res.status(200).json({
        status: "success",
        data: updatedDestination
    });
});

/**
 * Delete a destination by ID
 * DELETE /api/v1/destinations/:id
 */
exports.deleteDestination = catchAsync(async (req, res) => {
    const deletedDestination = await destinationService.deleteDestination(req.params.id);

    res.status(200).json({
        status: "success",
        data: deletedDestination
    });
});
