const Hotel = require("../../../shared/models/hotel.model");
const mongoose = require("mongoose");
const AppError = require("../../../shared/utils/appError.utils");

//  * Create a new hotel

const createHotel = async (data) => {
  const hotel = new Hotel(data);
  await hotel.save();
  return hotel;
};

// Get all hotels with filtering, pagination, and sorting

const getAllHotels = async (filters = {}, pagination = {}, sorting = {}) => {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter query
  const query = {};

  if (filters.city) {
    query["location.city"] = filters.city;
  }

  if (filters.country) {
    query["location.countryCode"] = filters.country;
  }

  if (filters.minRate) {
    query.lowRate = { $gte: Number(filters.minRate) };
  }

  if (filters.maxRate) {
    query.highRate = { $lte: Number(filters.maxRate) };
  }

  if (filters.propertyCategory) {
    query.propertyCategory = filters.propertyCategory;
  }

  if (filters.search) {
    query.name = { $regex: filters.search, $options: "i" };
  }

  // Build sort object
  const sort = {};
  if (sorting.sort === "rating") {
    sort.hotelRating = 1;
  } else if (sorting.sort === "-rating") {
    sort.hotelRating = -1;
  } else {
    sort.createdAt = -1;
  }

  // Execute queries
  const hotels = await Hotel.find(query).sort(sort).skip(skip).limit(limit);
  const total = await Hotel.countDocuments(query);

  return {
    hotels,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

//  * Get a single hotel by ID

const getHotelById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid hotel ID", 400);
  }

  const hotel = await Hotel.findById(id);

  if (!hotel) {
    throw new AppError("Hotel not found", 404);
  }

  return hotel;
};

//  * Update a hotel by ID

const updateHotel = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid hotel ID", 400);
  }

  const updatedHotel = await Hotel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!updatedHotel) {
    throw new AppError("Hotel not found", 404);
  }

  return updatedHotel;
};

//  * Delete a hotel by ID
const deleteHotel = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid hotel ID", 400);
  }

  const deletedHotel = await Hotel.findByIdAndDelete(id);

  if (!deletedHotel) {
    throw new AppError("Hotel not found", 404);
  }

  return deletedHotel;
};

module.exports = {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
};
