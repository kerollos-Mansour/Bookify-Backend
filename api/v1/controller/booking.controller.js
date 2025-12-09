const Booking = require("../../../shared/models/bookingModel");

exports.createBooking = async (req, res, next) => {
  try {
    const {
      userId,
      hotelId,
      roomId,
      checkIn,
      checkOut,
      nights,
      pricePerNight,
      subtotal,
      guests,
      bookingNumber,
      currency = "USD",
    } = req.body;

    // Basic validation
    if (
      !userId ||
      !hotelId ||
      !roomId ||
      !checkIn ||
      !checkOut ||
      !nights ||
      !guests ||
      !bookingNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid dates",
      });
    }

    // Calculate total price if not provided
    const totalPrice = subtotal || (pricePerNight * nights) || 335;

    // ADD THIS LINE - createdAt is REQUIRED by your schema
    const createdAt = new Date();

    const booking = new Booking({
      userId,
      hotelId,
      roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      guests,
      pricePerNight,
      totalPrice,
      subtotal,
      bookingNumber, // This is required
      currency,
      createdAt, // ← REQUIRED FIELD!
      status: "pending",
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking created",
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      totalPrice,
      nights: booking.nights,
      checkIn: booking.checkIn.toISOString().split('T')[0],
      checkOut: booking.checkOut.toISOString().split('T')[0],
    });
  } catch (err) {
    console.error("Error:", err);
    
    // Add better error handling
    if (err.name === 'ValidationError') {
      const missingFields = Object.keys(err.errors).join(', ');
      return res.status(400).json({
        success: false,
        message: `Validation failed. Missing: ${missingFields}`,
        errors: Object.values(err.errors).map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
exports.getBooking = async (req, res, next) => {
  try{
  // 1. Find by bookingReference OR _id
  const bookings =  await Booking.find();
  res.status(200).json(bookings)
  // 2. Populate hotel, room, user info
  // 3. Return with virtual fields (duration, pricePerNight)
  }catch(err){
    next(err);
  }
};
exports.getBookingId = async (req, res, next) => {
  try{
  // 1. Find by bookingReference OR _id
  const id = req.params.id
  const bookings =  await Booking.findById(id);
  res.status(200).json(bookings)
  // 2. Populate hotel, room, user info
  // 3. Return with virtual fields (duration, pricePerNight)
  }catch(err){
    next(err);
  }
};

exports.cancelBooking = async (req, res) => {
  // 1. Check if booking can be cancelled (based on dates)
  // 2. Apply cancellation policy
  // 3. Calculate refund amount
  // 4. Update status to "cancelled"
  // 5. Send cancellation email
};
//////hiiiii