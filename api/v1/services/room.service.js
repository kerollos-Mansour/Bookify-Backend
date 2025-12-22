const Rooms = require("../../../shared/models/rooms.model");
const mongoose = require("mongoose");
const AppError = require("../../../shared/utils/appError.utils");

/**
 * Create a new room
 */
exports.createRoom = async (data) => {
    const { hotelId, name, sleeps, price } = data;

    // Validate required fields
    if (!hotelId || !name || !sleeps || !price) {
        throw new AppError(
            "Missing required fields: hotelId, name, sleeps, price",
            400
        );
    }

    if (!mongoose.isValidObjectId(hotelId)) {
        throw new AppError("Hotel ID is not valid", 400);
    }

    let parsedPrice;
    if (typeof price === 'string') {
        try {
            parsedPrice = JSON.parse(price.trim());
        } catch (err) {
            throw new AppError("Invalid price format: must be valid JSON", 400);
        }
    } else {
        parsedPrice = price;
    }

    if (!parsedPrice.original || typeof parsedPrice.original !== 'number' || parsedPrice.original <= 0) {
        throw new AppError("Price must have a valid positive 'original' number", 400);
    }

    const roomData = {
        ...data,
        price: parsedPrice,
    };

    const newRoom = await Rooms.create(roomData);
    await newRoom.populate("hotelId");
    await newRoom.populate("amenities");

    return newRoom;
};

/**
 * Get all rooms for a specific hotel with filtering and pagination
 */
exports.getAllRoomsForHotel = async (hotelId, filters = {}, pagination = {}) => {
    if (!hotelId || !mongoose.isValidObjectId(hotelId)) {
        throw new AppError("Hotel ID is not valid", 400);
    }

    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
        hotelId: new mongoose.Types.ObjectId(hotelId),
    };

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.minPrice) {
        query["price.original"] = { $gte: Number(filters.minPrice) };
    }

    if (filters.maxPrice) {
        query["price.original"] = {
            ...query["price.original"],
            $lte: Number(filters.maxPrice),
        };
    }

    // Execute queries
    const rooms = await Rooms.find(query)
        .populate("hotelId")
        .populate("amenities")
        .skip(skip)
        .limit(limit);

    const total = await Rooms.countDocuments(query);

    return {
        rooms,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get a single room by ID
 */
exports.getRoomById = async (id) => {
    if (!id || !mongoose.isValidObjectId(id)) {
        throw new AppError("Room ID is not valid", 400);
    }

    const room = await Rooms.findById(id)
        .populate("hotelId")
        .populate("amenities");

    if (!room) {
        throw new AppError("Room not found", 404);
    }

    return room;
};

/**
 * Update a room by ID
 */
exports.updateRoom = async (id, data) => {
    if (!id || !mongoose.isValidObjectId(id)) {
        throw new AppError("Room ID is not valid", 400);
    }

    // Prevent changing hotel association
    if (data.hotelId) {
        throw new AppError("Cannot change hotel for a room", 400);
    }

    const allowedFields = [
        "name",
        "images",
        "amenities",
        "size",
        "sleeps",
        "bedType",
        "allInclusive",
        "bedrooms",
        "refundable",
        "price",
        "status",
        "quantity",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
        if (data[field] !== undefined) {
            updateData[field] = data[field];
        }
    });

    const updatedRoom = await Rooms.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    })
        .populate("hotelId")
        .populate("amenities");

    if (!updatedRoom) {
        throw new AppError("Room not found", 404);
    }

    return updatedRoom;
};

/**
 * Delete a room by ID
 */
exports.deleteRoom = async (id) => {
    if (!id || !mongoose.isValidObjectId(id)) {
        throw new AppError("Room ID is not valid", 400);
    }

    const deletedRoom = await Rooms.findByIdAndDelete(id);

    if (!deletedRoom) {
        throw new AppError("Room not found", 404);
    }

    return deletedRoom;
};

/**
 * Get rooms by status for a specific hotel
 */
exports.getRoomsByStatus = async (hotelId, status) => {
    if (!hotelId || !mongoose.isValidObjectId(hotelId)) {
        throw new AppError("Hotel ID is not valid", 400);
    }

    if (!["available", "occupied", "maintenance"].includes(status)) {
        throw new AppError(
            "Invalid status. Must be: available, occupied, or maintenance",
            400
        );
    }

    const rooms = await Rooms.find({
        hotelId: new mongoose.Types.ObjectId(hotelId),
        status,
    })
        .populate("hotelId")
        .populate("amenities");

    return rooms;
};

