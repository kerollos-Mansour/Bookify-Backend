const amenityService = require("../services/amenity.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");

/**
 * Create a new amenity
 * POST /api/v1/amenities
 */
const createAmenity = catchAsync(async (req, res, next) => {
    const amenity = await amenityService.createAmenity(req.body);

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { amenity }
    });
});

/**
 * Get all amenities with filtering and pagination
 * GET /api/v1/amenities?category=room&search=wifi&page=1&limit=10
 */
const getAmenities = catchAsync(async (req, res, next) => {
    const { category, search } = req.query;
    const { page, limit } = req.query;

    const filters = { category, search };
    const pagination = { page, limit };

    const result = await amenityService.getAllAmenities(filters, pagination);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            amenities: result.amenities,
            page: result.pagination.page,
            totalPages: result.pagination.totalPages,
            totalAmenities: result.pagination.total
        }
    });
});

/**
 * Get a single amenity by ID
 * GET /api/v1/amenities/:id
 */
const getAmenityById = catchAsync(async (req, res, next) => {
    const amenity = await amenityService.getAmenityById(req.params.id);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { amenity }
    });
});

/**
 * Update an amenity by ID
 * PUT /api/v1/amenities/:id
 */
const updateAmenity = catchAsync(async (req, res, next) => {
    const updatedAmenity = await amenityService.updateAmenity(req.params.id, req.body);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { amenity: updatedAmenity }
    });
});

/**
 * Delete an amenity by ID
 * DELETE /api/v1/amenities/:id
 */
const deleteAmenity = catchAsync(async (req, res, next) => {
    await amenityService.deleteAmenity(req.params.id);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "Amenity deleted successfully"
    });
});

module.exports = {
    createAmenity,
    getAmenities,
    getAmenityById,
    updateAmenity,
    deleteAmenity,
};
