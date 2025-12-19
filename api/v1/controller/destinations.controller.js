const destinationService = require("../services/destinations.service");
const catchAsync = require("../../../shared/utils/catchError.utils");

/**
 * GET /destinations
 * Get all destinations (optionally by category)
 */
const getAllDestinations = catchAsync(async (req, res) => {
    const filters = {
        categoryId: req.query.categoryId,
        bestSeller: req.query.bestSeller === 'true',
        featured: req.query.featured === 'true'
    };
    
    const pagination = {
        page: req.query.page,
        limit: req.query.limit
    };
    
    const result = await destinationService.getAllDestinations(filters, pagination);
    
    res.status(200).json({
        status: "success",
        data: result
    });
});

/**
 * GET /destinations/grouped
 * Get destinations grouped by category (for homepage)
 */
const getGroupedDestinations = catchAsync(async (req, res) => {
    const result = await destinationService.getDestinationsGroupedByCategory();
    
    res.status(200).json({
        status: "success",
        data: result
    });
});

/**
 * GET /destinations/:identifier
 * Get single destination by ID or slug
 */
const getDestination = catchAsync(async (req, res) => {
    const destination = await destinationService.getDestination(req.params.identifier);
    
    res.status(200).json({
        status: "success",
        data: { destination }
    });
});

/**
 * GET /destinations/:identifier/search
 * THE KEY ENDPOINT: Execute pre-configured search for a destination
 * This is called when user clicks "Explore Cairo"
 */
const searchByDestination = catchAsync(async (req, res) => {
    const { identifier } = req.params;
    
    // User can override some filters on the search page
    const userOverrides = {
        minRate: req.query.minRate,
        maxRate: req.query.maxRate,
        sort: req.query.sort,
        checkIn: req.query.checkIn,
        checkOut: req.query.checkOut,
        adults: req.query.adults,
        rooms: req.query.rooms
    };
    
    const pagination = {
        page: req.query.page,
        limit: req.query.limit
    };
    
    const result = await destinationService.searchByDestination(
        identifier,
        userOverrides,
        pagination
    );
    
    res.status(200).json({
        status: "success",
        data: result
    });
});

/**
 * POST /destinations
 * Create new destination (admin)
 */
const createDestination = catchAsync(async (req, res) => {
    const destination = await destinationService.createDestination(req.body);
    
    res.status(201).json({
        status: "success",
        data: { destination }
    });
});

/**
 * PATCH /destinations/:id
 * Update destination (admin)
 */
const updateDestination = catchAsync(async (req, res) => {
    const destination = await destinationService.updateDestination(
        req.params.id,
        req.body
    );
    
    res.status(200).json({
        status: "success",
        data: { destination }
    });
});

/**
 * DELETE /destinations/:id
 * Delete destination (admin)
 */
const deleteDestination = catchAsync(async (req, res) => {
    await destinationService.deleteDestination(req.params.id);
    
    res.status(204).json({
        status: "success",
        data: null
    });
});

module.exports = {
    getAllDestinations,
    getGroupedDestinations,
    getDestination,
    searchByDestination,
    createDestination,
    updateDestination,
    deleteDestination
};