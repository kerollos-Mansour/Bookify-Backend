const Destination = require("../../../shared/models/destinations.model");
const AppError = require("../../../shared/utils/appError.utils");

const createDestination = async (data) => {
  const destination = new Destination(data);
  await destination.save();
  return destination;
};

//   Get all destinations with optional filtering and pagination

const getAllDestinations = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const query = {};

  // Apply filters
  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute query
  const destinations = await Destination.find(query)
    .skip(skip)
    .limit(Number(limit));

  // Get total count for pagination metadata
  const total = await Destination.countDocuments(query);

  return {
    destinations,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

//  * Get a single destination by ID

const getDestinationById = async (id) => {
  const destination = await Destination.findById(id);

  if (!destination) {
    throw new AppError("Destination not found", 404);
  }

  return destination;
};

//   Update a destination by ID

const updateDestination = async (id, data) => {
  const updatedDestination = await Destination.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!updatedDestination) {
    throw new AppError("Destination not found", 404);
  }

  return updatedDestination;
};

//  * Delete a destination by ID
const deleteDestination = async (id) => {
  const deletedDestination = await Destination.findByIdAndDelete(id);

  if (!deletedDestination) {
    throw new AppError("Destination not found", 404);
  }

  return deletedDestination;
};

module.exports = {
  createDestination,
  getAllDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
};
