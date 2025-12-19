const Hotel = require("../../../shared/models/hotel.model");
const Room = require("../../../shared/models/rooms.model");
const Booking = require("../../../shared/models/booking.model");
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

  // Location search - searches both hotel name AND city
  if (filters.location) {
    query.$or = [
      { name: { $regex: filters.location, $options: "i" } },
      { "location.city": { $regex: filters.location, $options: "i" } },
      { "location.address": { $regex: filters.location, $options: "i" } }
    ];
  }

  if (filters.featured !== undefined) {
    query.featured = filters.featured === "true";
  }


  if (filters.city) {
    query["location.city"] = { $regex: filters.city, $options: "i" };
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
  } else if (sorting.sort === "price") {
    sort.lowRate = 1;
  } else if (sorting.sort === "-price") {
    sort.lowRate = -1;
  } else {
    sort.createdAt = -1;
  }

  // Execute initial hotel query
  let hotels = await Hotel.find(query).sort(sort).skip(skip).limit(limit);

  // If checkIn/checkOut dates are provided, filter by room availability
  if (filters.checkIn && filters.checkOut) {
    const checkInDate = new Date(filters.checkIn);
    const checkOutDate = new Date(filters.checkOut);

    // Get hotel IDs from initial results
    const hotelIds = hotels.map(h => h._id);

    // Find all rooms for these hotels
    const roomQuery = { hotelId: { $in: hotelIds }, status: "available" };

    // Filter by capacity if provided
    if (filters.adults) {
      roomQuery.sleeps = { $gte: filters.adults };
    }

    const availableRooms = await Room.find(roomQuery);

    // Find bookings that overlap with the requested dates
    const overlappingBookings = await Booking.find({
      hotelId: { $in: hotelIds },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ],
      status: { $in: ["pending", "confirmed"] }
    });

    // Group rooms by hotel and check availability
    const hotelRoomAvailability = {};

    availableRooms.forEach(room => {
      const hotelId = room.hotelId.toString();
      if (!hotelRoomAvailability[hotelId]) {
        hotelRoomAvailability[hotelId] = [];
      }
      hotelRoomAvailability[hotelId].push(room);
    });

    // Remove booked rooms from availability
    overlappingBookings.forEach(booking => {
      const hotelId = booking.hotelId.toString();
      const roomId = booking.roomId.toString();

      if (hotelRoomAvailability[hotelId]) {
        hotelRoomAvailability[hotelId] = hotelRoomAvailability[hotelId].filter(
          room => room._id.toString() !== roomId
        );
      }
    });

    // Filter hotels that have available rooms
    hotels = hotels.filter(hotel => {
      const hotelId = hotel._id.toString();
      const availableRoomsForHotel = hotelRoomAvailability[hotelId] || [];

      // If rooms filter is provided, check if hotel has enough available rooms
      if (filters.rooms) {
        return availableRoomsForHotel.length >= filters.rooms;
      }

      return availableRoomsForHotel.length > 0;
    });

    // Attach available room count to each hotel
    hotels = hotels.map(hotel => {
      const hotelObj = hotel.toObject();
      const hotelId = hotel._id.toString();
      const availableRoomsForHotel = hotelRoomAvailability[hotelId] || [];

      hotelObj.availableRooms = availableRoomsForHotel.length;
      hotelObj.lowestAvailableRate = availableRoomsForHotel.length > 0
        ? Math.min(...availableRoomsForHotel.map(r => r.price.original))
        : null;

      return hotelObj;
    });
  }

  const total = await Hotel.countDocuments(query);

  return {
    hotels,
    pagination: {
      page,
      limit,
      total: hotels.length, // Use filtered count if dates are provided
      totalPages: Math.ceil(hotels.length / limit),
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
