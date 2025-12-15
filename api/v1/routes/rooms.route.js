const express = require("express");
const router = express.Router();
const {
    getAllRoomsForHotel,
    getRoomsByStatus,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
} = require("../controller/room.controller");
const validate = require("../../../shared/middlewares/validate.middleware");
const { protect, allowTo } = require("../../../shared/middlewares/jwt.middle");
const {
    createRoomSchema,
    updateRoomSchema,
    roomIdSchema,
    roomQuerySchema,
} = require("../validators/room.validator");

// Get all rooms for a specific hotel
router.get(
    "/hotel/:hotelId",
    validate({ query: roomQuerySchema }),
    getAllRoomsForHotel
);

// Get rooms by status (available, occupied, maintenance)
router.get(
    "/hotel/:hotelId/status/:status",
    validate({ query: roomQuerySchema }),
    getRoomsByStatus
);
router.get("/:roomId", validate({ params: roomIdSchema }), getRoomById);

// Protected routes - Admin only
router.post(
    "/",
    protect,
    allowTo("admin"),
    validate(createRoomSchema),
    createRoom
);
router.put(
    "/:roomId",
    protect,
    allowTo("admin"),
    validate({ params: roomIdSchema, body: updateRoomSchema }),
    updateRoom
);
router.delete(
    "/:roomId",
    protect,
    allowTo("admin"),
    validate({ params: roomIdSchema }),
    deleteRoom
);

module.exports = router;
