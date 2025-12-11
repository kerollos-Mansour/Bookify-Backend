// const Booking = require("../../../shared/models/booking.model");
// const AppError = require("../../../shared/utils/appError.utils");

// /**
//  * Booking Service
//  * Contains all business logic for booking management
//  */

// //   Create a new booking
// const createBooking = async (bookingData) => {
//   const {
//     userId,
//     hotelId,
//     roomId,
//     checkIn,
//     checkOut,
//     nights,
//     pricePerNight,
//     subtotal,
//     // guests,
//     bookingNumber,
//     currency = "USD",
//   } = bookingData;

//   // Validate required fields
//   if (
//     !userId ||
//     !hotelId ||
//     !roomId ||
//     !checkIn ||
//     !checkOut ||
//     !nights ||
//     !guests ||
//     !bookingNumber
//   ) {
//     throw new AppError("All required fields must be provided", 400);
//   }

//   // Parse and validate dates
//   const checkInDate = new Date(checkIn);
//   const checkOutDate = new Date(checkOut);

  // if (checkInDate >= checkOutDate) {
  //   throw new AppError("Check-out date must be after check-in date", 400);
  // }

//   // Calculate total price
//   const totalPrice = subtotal || pricePerNight * nights || 0;

//   // Create booking
//   const booking = new Booking({
//     userId,
//     hotelId,
//     roomId,
//     checkIn: checkInDate,
//     checkOut: checkOutDate,
//     nights,
//     guests,
//     pricePerNight,
//     totalPrice,
//     subtotal,
//     bookingNumber,
//     currency,
//     createdAt: new Date(),
//     status: "pending",
//   });

//   await booking.save();

//   return {
//     booking,
//     metadata: {
//       bookingId: booking._id,
//       bookingNumber: booking.bookingNumber,
//       totalPrice,
//       nights: booking.nights,
//       checkIn: booking.checkIn.toISOString().split("T")[0],
//       checkOut: booking.checkOut.toISOString().split("T")[0],
//     },
//   };
// };

// //   Get all bookings
// const getAllBookings = async () => {
//   const bookings = await Booking.find();
//   return bookings;
// };

// //   Get a single booking by ID
// const getBookingById = async (id) => {
//   const booking = await Booking.findById(id);

//   if (!booking) {
//     throw new AppError("Booking not found", 404);
//   }

//   return booking;
// };

// //  * Cancel a booking by ID

// const cancelBooking = async (id) => {
//   const booking = await Booking.findById(id);

//   if (!booking) {
//     throw new AppError("Booking not found", 404);
//   }

//   // Check if booking can be cancelled
//   if (booking.status === "cancelled") {
//     throw new AppError("Booking is already cancelled", 400);
//   }

//   if (booking.status === "completed") {
//     throw new AppError("Cannot cancel a completed booking", 400);
//   }

//   // Update status to cancelled
//   booking.status = "cancelled";
//   booking.updatedAt = new Date();
//   await booking.save();

//   return booking;
// };

// module.exports = {
//   createBooking,
//   getAllBookings,
//   getBookingById,
//   cancelBooking,
// };


const Booking = require("../../../shared/models/booking.model");
const AppError = require("../../../shared/utils/appError.utils");
const { calculateNights, generateBookingNumber, calculateTotalPrice } = require("../../../shared/utils/booking.utils");

/**
 * Booking Service
 * Contains all business logic for booking management
 */


//   Create a new booking
const createBooking = async (user, data) => {
  const { hotelId, roomId, checkIn, checkOut, pricePerNight, fees = 0 } = data;

  if (!hotelId || !roomId || !checkIn || !checkOut || !pricePerNight) {
    throw new AppError("Missing required fields", 400);
  }

  const nights = calculateNights(checkIn, checkOut);
  if (nights <= 0) {
    throw new AppError("Invalid dates", 400);
  }

  const price = calculateTotalPrice({ pricePerNight, nights, fees });
  if (price.total < 0){
    throw new AppError("Total price cannot be negative", 400);
  } 

  const booking = new Booking({
    userId: user._id,
    hotelId,
    roomId,
    checkIn,
    checkOut,
    nights,
    pricePerNight,
    subtotal: price.subtotal,
    totalPrice: price.total,
    fees,
    bookingNumber: generateBookingNumber(),
    currency: "USD"
  });

  await booking.save();
  return booking;
};


const getAllBookings = async (user) => {
  if (!user.isAdmin){
    throw new AppError("Access denied", 403);
  }
    
  return await Booking.find()
    .populate("userId", "username email")
    .populate("hotelId", "name")
    .populate("roomId", "name")
    .sort({ createdAt: -1 });
};


const getUserBookings = async (user) => {
  return await Booking.find({ userId: user._id })
    .populate("hotelId", "name")
    .populate("roomId", "name")
    .sort({ createdAt: -1 });
};


const getBookingById = async (user, id) => {
  const booking = await Booking.findById(id)
    .populate("userId", "username email")
    .populate("hotelId")
    .populate("roomId");

  if (!booking){
    throw new AppError("Booking not found", 404);
  } 

  if (!user.isAdmin && booking.userId._id.toString() !== user._id.toString()) {
    throw new AppError("Access denied", 403);
  }

  return booking;
};


const updateBookingStatus = async (user, id, status) => {
  if (!user.isAdmin){
    throw new AppError("Access denied", 403);
  } 

  const validStatuses = ["pending", "confirmed", "cancelled", "completed", "no-show"];
  if (!validStatuses.includes(status)){
    throw new AppError("Invalid status", 400);
  } 

  const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
  if (!booking){
    throw new AppError("Booking not found", 404);
  } 

  return booking;
};


const cancelBooking = async (user, id) => {
  const booking = await Booking.findById(id);

  if (!booking){
    throw new AppError("Booking not found", 404);
  } 

  if (booking.userId.toString() !== user._id.toString()) {
    throw new AppError("Access denied", 403);
  }

  if (booking.status === "cancelled") {
    throw new AppError("Booking is already cancelled", 400);
  }

  if (booking.status === "completed") {
    throw new AppError("Cannot cancel a completed booking", 400);
  }

  booking.status = "cancelled";
  await booking.save();
  return booking;
};


module.exports = {
  createBooking,
  getAllBookings,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
};