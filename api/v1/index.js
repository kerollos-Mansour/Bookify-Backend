const express = require("express");
const router = express.Router();

// Routes
const destinationRoutes = require("./routes/destinations.route");
const hotelRoutes = require("./routes/hotel.route");
const bookingRoutes = require("./routes/booking.route");
const userRoutes = require("./routes/user.route");
const authRouter = require("./routes/auth.route");
const roomRoutes = require("./routes/rooms.route");
const couponRoutes = require("./routes/coupons.route");
const amenityRoutes = require("./routes/amenities.route");
const categoryRoutes = require("./routes/category.route");
const imageRoutes = require("./routes/image.route");

// Mount route modules
router.use("/destinations", destinationRoutes);
router.use("/hotels", hotelRoutes);
router.use("/bookings", bookingRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRouter);
router.use("/rooms", roomRoutes);
router.use("/coupons", couponRoutes);
router.use("/amenities", amenityRoutes);
router.use("/categories", categoryRoutes);
router.use("/images", imageRoutes);

module.exports = router;
