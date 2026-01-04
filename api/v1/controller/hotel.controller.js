const hotelService = require("../services/hotel.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");


/**
 * Create a new hotel
 * POST /api/v1/hotels
 */
const createHotel = catchAsync(async (req, res, next) => {
    if (req.files) {
        req.body.images = req.files.map(file => file.path);
    }

    const hotel = await hotelService.createHotel(req.body, req.user);

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { hotel }
    });
});

/**
 * Get all hotels with filtering, pagination, and sorting
 * GET /api/v1/hotels?location=xxx&checkIn=2024-02-06&checkOut=2024-02-08&adults=2&rooms=1&city=xxx&country=xxx&minRate=100&maxRate=500&search=xxx&sort=rating&page=1&limit=10
 */const getHotels = catchAsync(async (req, res, next) => {
    const {
        city,
        country,
        minRate,
        maxRate,
        propertyCategory,
        search, // Main search (hotel name OR location)
        name,   // Specific hotel name filter from sidebar
        location,
        featured,
        checkIn,
        checkOut,
        adults,
        rooms,
        types,
        amenities,
        hotelRating
    } = req.query;
    const { page, limit } = req.query;
    const { sort } = req.query;

    const filters = {
        city,
        country,
        minRate,
        maxRate,
        propertyCategory,
        search,      // Main search from SearchBar (hotel name OR location)
        name: name || undefined, // Specific hotel name from sidebar
        location,
        featured,
        checkIn,
        checkOut,
        adults: adults ? Number(adults) : undefined,
        rooms: rooms ? Number(rooms) : undefined,
        types,
        amenities,
        hotelRating
    };
    const pagination = { page, limit };
    const sorting = { sort };

    const result = await hotelService.getAllHotels(filters, pagination, sorting, req.user);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            hotels: result.hotels,
            page: result.pagination.page,
            totalPages: result.pagination.totalPages,
            totalHotels: result.pagination.total
        }
    });
});
/**
 * Get a single hotel by ID
 * GET /api/v1/hotels/:id
 */
const getHotelById = catchAsync(async (req, res, next) => {
    const hotel = await hotelService.getHotelById(req.params.id);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { hotel }
    });
});

/**
 * Update a hotel by ID
 * PUT /api/v1/hotels/:id
 */
const updateHotel = catchAsync(async (req, res, next) => {
    const updatedHotel = await hotelService.updateHotel(req.params.id, req.body, req.user);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { hotel: updatedHotel }
    });
});

/**
 * Delete a hotel by ID
 * DELETE /api/v1/hotels/:id
 */
const deleteHotel = catchAsync(async (req, res, next) => {
    await hotelService.deleteHotel(req.params.id, req.user);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "Hotel deleted successfully"
    });
});

module.exports = {
    createHotel,
    getHotels,
    getHotelById,
    updateHotel,
    deleteHotel,
};