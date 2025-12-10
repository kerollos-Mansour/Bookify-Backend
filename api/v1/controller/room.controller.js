const roomService = require("../services/room.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");

/**
 * Get all rooms for a specific hotel
 * GET /api/v1/rooms/hotel/:hotelId
 */
exports.getAllRoomsForHotel = catchAsync(async (req, res) => {
    const { hotelId } = req.params;
    const { status, minPrice, maxPrice, page, limit } = req.query;

    const filters = { status, minPrice, maxPrice };
    const pagination = { page, limit };

    const result = await roomService.getAllRoomsForHotel(
        hotelId,
        filters,
        pagination
    );

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            rooms: result.rooms,
            page: result.pagination.page,
            totalPages: result.pagination.totalPages,
            totalRooms: result.pagination.total,
        },
    });
});

/**
 * Get a single room by ID
 * GET /api/v1/rooms/:roomId
 */
exports.getRoomById = catchAsync(async (req, res) => {
    const room = await roomService.getRoomById(req.params.roomId);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { room },
    });
});

/**
 * Create a new room
 * POST /api/v1/rooms
 */
exports.createRoom = catchAsync(async (req, res) => {
    const newRoom = await roomService.createRoom(req.body);

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        message: "Room created successfully",
        data: { room: newRoom },
    });
});

/**
 * Update a room by ID
 * PUT /api/v1/rooms/:roomId
 */
exports.updateRoom = catchAsync(async (req, res) => {
    const updatedRoom = await roomService.updateRoom(
        req.params.roomId,
        req.body
    );

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "Room updated successfully",
        data: { room: updatedRoom },
    });
});

/**
 * Delete a room by ID
 * DELETE /api/v1/rooms/:roomId
 */
exports.deleteRoom = catchAsync(async (req, res) => {
    await roomService.deleteRoom(req.params.roomId);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "Room deleted successfully",
    });
});

/**
 * Get rooms by status for a specific hotel
 * GET /api/v1/rooms/hotel/:hotelId/status/:status
 */
exports.getRoomsByStatus = catchAsync(async (req, res) => {
    const { hotelId, status } = req.params;

    const rooms = await roomService.getRoomsByStatus(hotelId, status);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        length: rooms.length,
        data: { rooms },
    });
});

