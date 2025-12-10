const Amenity = require("../../../shared/models/amenity.model");
const mongoose = require("mongoose");
const AppError = require("../../../shared/utils/appError.utils");

/**
 * Create a new amenity
 */
const createAmenity = async (data) => {
    const amenity = new Amenity(data);
    await amenity.save();
    return amenity;
};

/**
 * Get all amenities with filtering and pagination
 */
const getAllAmenities = async (filters = {}, pagination = {}) => {
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const query = {};

    if (filters.category) {
        query.category = filters.category;
    }

    if (filters.search) {
        query.name = { $regex: filters.search, $options: "i" };
    }

    // Execute queries
    const amenities = await Amenity.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);
    const total = await Amenity.countDocuments(query);

    return {
        amenities,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get a single amenity by ID
 */
const getAmenityById = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid amenity ID", 400);
    }

    const amenity = await Amenity.findById(id);

    if (!amenity) {
        throw new AppError("Amenity not found", 404);
    }

    return amenity;
};

/**
 * Update an amenity by ID
 */
const updateAmenity = async (id, data) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid amenity ID", 400);
    }

    const updatedAmenity = await Amenity.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });

    if (!updatedAmenity) {
        throw new AppError("Amenity not found", 404);
    }

    return updatedAmenity;
};

/**
 * Delete an amenity by ID
 */
const deleteAmenity = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid amenity ID", 400);
    }

    const deletedAmenity = await Amenity.findByIdAndDelete(id);

    if (!deletedAmenity) {
        throw new AppError("Amenity not found", 404);
    }

    return deletedAmenity;
};

module.exports = {
    createAmenity,
    getAllAmenities,
    getAmenityById,
    updateAmenity,
    deleteAmenity,
};
