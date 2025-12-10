const roomsControllers = require("../controller/room.controller");
const express = require("express");
const router = express.Router();

// Get all rooms for a specific hotel
router.get("/hotel/:hotelId", roomsControllers.getAllRoomsForHotel);

// Get rooms by status (available, occupied, maintenance)
router.get("/hotel/:hotelId/status/:status", roomsControllers.getRoomsByStatus);
router.get("/:roomId", roomsControllers.getRoomById);
router.post("/", roomsControllers.createRoom);
router.put("/:roomId", roomsControllers.updateRoom);
router.delete("/:roomId", roomsControllers.deleteRoom);

module.exports = router;
