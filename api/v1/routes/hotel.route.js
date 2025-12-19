const express = require("express");
const {
    createHotel,
    getHotels,
    getHotelById,
    updateHotel,
    deleteHotel,
} = require("../controller/hotel.controller");
const validate = require("../../../shared/middlewares/validate.middleware");
const { protect, allowTo } = require("../../../shared/middlewares/jwt.middle");
const {
    createHotelSchema,
    updateHotelSchema,
    hotelIdSchema,
    hotelQuerySchema,
} = require("../validators/hotel.validator");
const upload = require("../../../shared/config/multer.config");

const router = express.Router();

// Public routes
router.get("/", validate({ query: hotelQuerySchema }), getHotels);
router.get("/:id", validate({ params: hotelIdSchema }), getHotelById);

// Protected routes - Admin only
router.post(
    "/",
    protect,
    allowTo("admin"),
    upload.array("images", 10),
    createHotel
);
router.put(
    "/:id",
    protect,
    allowTo("admin"),
    validate({ params: hotelIdSchema, body: updateHotelSchema }),
    updateHotel
);
router.delete(
    "/:id",
    protect,
    allowTo("admin"),
    validate({ params: hotelIdSchema }),
    deleteHotel
);

module.exports = router;
