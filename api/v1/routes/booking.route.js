const express = require("express");
const router = express.Router();
const {
    createBooking,
    getBooking,
} = require("../controller/booking.controller");
const { get } = require("mongoose");
router.post("/", createBooking);
router.get("/", getBooking);
router.get('/:id', getBooking);

module.exports = router;
