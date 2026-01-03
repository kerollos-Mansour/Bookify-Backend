const Hotel = require("../../../shared/models/hotel.model");
const Room = require("../../../shared/models/rooms.model");
const Booking = require("../../../shared/models/booking.model");
const mongoose = require("mongoose");
const AppError = require("../../../shared/utils/appError.utils");
const Amenity = require("../../../shared/models/amenity.model");

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
const getAllHotels = async (filters = {}, pagination = {}, sorting = {}, user = null) => {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;
  const skip = (page - 1) * limit;
  // Build filter query
  const query = {};
  if (user && user.role === 'vendor') {
    query.ownerId = user._id;
  }

  let validHotelIds = null;
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
    const suitableRooms = await Room.find(roomQuery).select("_id hotelId");

    // Get all potentially suitable rooms
    const suitableRoomIds = suitableRooms.map(r => r._id);
    const suitableHotelIds = [...new Set(suitableRooms.map(r => r.hotelId.toString()))];
    // Find bookings that overlap
    const overlappingBookings = await Booking.find({
      hotelId: { $in: suitableHotelIds },
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
      status: { $in: ["pending", "confirmed"] }
    }).select("hotelId roomId");
    // Identify fully booked rooms to exclude
    const bookedRoomIds = new Set(overlappingBookings.map(b => b.roomId.toString()));
    // Filter hotels that have at least one room NOT in bookedRoomIds
    // We need to count available rooms per hotel if 'filters.rooms' is specified
    const availableHotelMap = {};  // hotelId -> count
    suitableRooms.forEach(room => {
      if (!bookedRoomIds.has(room._id.toString())) {
        const hId = room.hotelId.toString();
        availableHotelMap[hId] = (availableHotelMap[hId] || 0) + 1;
      }
    });
    const roomsRequired = Number(filters.rooms) || 1;
    const validHotelIdsForDates = [];
    for (const [hId, count] of Object.entries(availableHotelMap)) {
      if (count >= roomsRequired) {
        validHotelIdsForDates.push(hId);
      }
    }

    validHotelIds = validHotelIdsForDates;
  }
  // 2. Amenities Check 
  if (filters.amenities && filters.amenities.length > 0) {
    let amenityNames = filters.amenities;
    if (typeof amenityNames === 'string') {
      amenityNames = amenityNames.split(',');
    }
    // Find Amenity IDs by name
    const amenitiesFound = await Amenity.find({
      name: { $in: amenityNames.map(n => new RegExp(`^${n.trim()}$`, 'i')) }
    });
    const amenityIds = amenitiesFound.map(a => a._id);
    if (amenityIds.length > 0) {
      // Find hotels that have rooms with these amenities

      const roomsWithAmenities = await Room.find({
        amenities: { $in: amenityIds }
      }).select("hotelId amenities");

      const hotelAmenitiesMap = {}; // hotelId -> Set(amenityId)
      roomsWithAmenities.forEach(r => {
        const hId = r.hotelId.toString();
        if (!hotelAmenitiesMap[hId]) hotelAmenitiesMap[hId] = new Set();
        if (r.amenities) r.amenities.forEach(a => hotelAmenitiesMap[hId].add(a.toString()));
      });

      const validHotelIdsForAmenities = [];
      const requiredIds = amenityIds.map(id => id.toString());

      for (const [hId, availableSet] of Object.entries(hotelAmenitiesMap)) {
        const hasAll = requiredIds.every(req => availableSet.has(req));
        if (hasAll) validHotelIdsForAmenities.push(hId);
      }
      // Intersect with availability results if they exist, or set as base
      if (validHotelIds !== null) {
        validHotelIds = validHotelIds.filter(id => validHotelIdsForAmenities.includes(id));
      } else {
        validHotelIds = validHotelIdsForAmenities;
      }
    } else {
      // Amenities requested but none found -> return empty
      validHotelIds = [];
    }
  }
  // Apply ID Constraints
  if (validHotelIds !== null) {
    query._id = { $in: validHotelIds };
  }

  // 3. Standard Filters
  if (filters.location) {
    query.$or = [
      { name: { $regex: filters.location, $options: "i" } },
      { "location.city": { $regex: filters.location, $options: "i" } },
      { "location.address": { $regex: filters.location, $options: "i" } }
    ];
  }
  // Property Type Filter
  if (filters.types && filters.types.length > 0) {
    let types = filters.types;
    if (typeof types === 'string') {
      types = types.split(',');
    }
    query.type = { $in: types.map(t => new RegExp(`^${t.trim()}$`, 'i')) };
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
  if (filters.hotelRating) {
    query.tripAdvisorRating = { $gte: Number(filters.hotelRating) };
  }

  if (filters.propertyCategory) {
    query.propertyCategory = filters.propertyCategory;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } }, // Added hotel name search
      { "location.city": { $regex: filters.search, $options: "i" } },
      { "location.address": { $regex: filters.search, $options: "i" } },
      { "location.countryCode": { $regex: filters.search, $options: "i" } }
    ];
  }


  if (filters.name) {
    query.name = { $regex: filters.name, $options: "i" };
  }
  // 4. Sorting
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

  // 5. Execution
  const total = await Hotel.countDocuments(query);
  let hotels = await Hotel.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);
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
