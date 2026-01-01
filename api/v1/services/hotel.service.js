const Hotel = require("../../../shared/models/hotel.model");
const Room = require("../../../shared/models/rooms.model");
const Booking = require("../../../shared/models/booking.model");
const mongoose = require("mongoose");
const AppError = require("../../../shared/utils/appError.utils");

//  * Create a new hotel

const createHotel = async (data, user) => {
  // If vendor, set ownerId to current user
  if (user && user.role === 'vendor') {
    data.ownerId = user._id;
  }
  const hotel = new Hotel(data);
  await hotel.save();
  return hotel;
};

// Get all hotels with filtering, pagination, and sorting

// Get all hotels with filtering, pagination, and sorting
const getAllHotels = async (filters = {}, pagination = {}, sorting = {}, user = null) => {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter query
  const query = {};

  // Filter by vendor ownership if user is vendor
  if (user && user.role === 'vendor') {
    query.ownerId = user._id;
  }

  // 1. Availability Pre-Check (Critical for Pagination)
  // If dates are provided, we must first find which hotels have ANY availability.
  // Otherwise, we'd paginate mixed results and filtering later would break page sizes.
  if (filters.checkIn && filters.checkOut) {
    const checkInDate = new Date(filters.checkIn);
    const checkOutDate = new Date(filters.checkOut);

    // Find all rooms that match capacity
    const roomQuery = { status: "available" };
    if (filters.adults) {
      roomQuery.sleeps = { $gte: Number(filters.adults) };
    }

    // Get all potentially suitable rooms
    const suitableRooms = await Room.find(roomQuery).select("_id hotelId");
    const suitableRoomIds = suitableRooms.map(r => r._id);
    const suitableHotelIds = [...new Set(suitableRooms.map(r => r.hotelId.toString()))];

    // Find bookings that overlap
    const overlappingBookings = await Booking.find({
      hotelId: { $in: suitableHotelIds },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate }
        }
      ],
      status: { $in: ["pending", "confirmed"] }
    }).select("hotelId roomId");

    // Identify fully booked rooms to exclude
    const bookedRoomIds = new Set(overlappingBookings.map(b => b.roomId.toString()));

    // Filter hotels that have at least one room NOT in bookedRoomIds
    // We need to count available rooms per hotel if 'filters.rooms' is specified
    const availableHotelMap = {}; // hotelId -> count

    suitableRooms.forEach(room => {
      if (!bookedRoomIds.has(room._id.toString())) {
        const hId = room.hotelId.toString();
        availableHotelMap[hId] = (availableHotelMap[hId] || 0) + 1;
      }
    });

    const validHotelIds = [];
    const roomsRequired = Number(filters.rooms) || 1;

    for (const [hId, count] of Object.entries(availableHotelMap)) {
      if (count >= roomsRequired) {
        validHotelIds.push(hId);
      }
    }

    // Apply this restriction to the main query
    query._id = { $in: validHotelIds };
  }

  // 2. Standard Filters
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

  // 3. Sorting
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

  // 4. Execution
  const total = await Hotel.countDocuments(query);
  let hotels = await Hotel.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Aggregate amenities for each hotel
  hotels = await Promise.all(
    hotels.map(async (hotelDoc) => {
      const hotel = hotelDoc.toObject();
      const rooms = await Room.find({ hotelId: hotel._id }).populate("amenities");

      const amenitiesMap = new Map();
      rooms.forEach((room) => {
        if (room.amenities && Array.isArray(room.amenities)) {
          room.amenities.forEach((amenity) => {
            if (amenity && amenity._id) {
              amenitiesMap.set(amenity._id.toString(), amenity);
            }
          });
        }
      });

      hotel.amenities = Array.from(amenitiesMap.values());
      return hotel;
    })
  );

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

  let hotel = await Hotel.findById(id);

  if (!hotel) {
    throw new AppError("Hotel not found", 404);
  }

  // Find all rooms for this hotel and populate amenities
  const rooms = await Room.find({ hotelId: id }).populate("amenities");

  // Aggregate unique amenities from all rooms
  const amenitiesMap = new Map();
  rooms.forEach((room) => {
    if (room.amenities && Array.isArray(room.amenities)) {
      room.amenities.forEach((amenity) => {
        // Ensure amenity exists (it might be null if the reference is broken)
        if (amenity && amenity._id) {
          amenitiesMap.set(amenity._id.toString(), amenity);
        }
      });
    }
  });

  // Convert hotel to object to attach amenities
  hotel = hotel.toObject();
  hotel.amenities = Array.from(amenitiesMap.values());

  return hotel;
};

//  * Update a hotel by ID

const updateHotel = async (id, data, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid hotel ID", 400);
  }

  // Check ownership for vendors
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new AppError("Hotel not found", 404);
  }

  if (user && user.role === 'vendor') {
    if (!hotel.ownerId || hotel.ownerId.toString() !== user._id.toString()) {
      throw new AppError("You do not have permission to update this hotel", 403);
    }
  }

  const updatedHotel = await Hotel.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return updatedHotel;
};

//  * Delete a hotel by ID
const deleteHotel = async (id, user) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid hotel ID", 400);
  }

  // Check ownership for vendors
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new AppError("Hotel not found", 404);
  }

  if (user && user.role === 'vendor') {
    if (!hotel.ownerId || hotel.ownerId.toString() !== user._id.toString()) {
      throw new AppError("You do not have permission to delete this hotel", 403);
    }
  }

  const deletedHotel = await Hotel.findByIdAndDelete(id);
  return deletedHotel;
};

module.exports = {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
};
