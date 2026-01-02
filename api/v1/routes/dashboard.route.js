const express = require("express");
const router = express.Router();
const {
    getStats,
    getRevenueData,
    getBookingsByStatus,
} = require("../controller/dashboard.controller");
const { protect } = require("../../../shared/middlewares/jwt.middleware");

// All dashboard routes require authentication
router.use(protect);

router.get("/stats", getStats);
router.get("/revenue", getRevenueData);
router.get("/bookings/status", getBookingsByStatus);

module.exports = router;
