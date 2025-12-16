const express = require("express");
const router = express.Router();
const {
    getAmenities,
    getAmenityById,
    createAmenity,
    updateAmenity,
    deleteAmenity,
} = require("../controller/amenity.controller");
const validate = require("../../../shared/middlewares/validate.middleware");
const { protect, allowTo } = require("../../../shared/middlewares/jwt.middle");
const {
    createAmenity: createAmenitySchema,
    updateAmenity: updateAmenitySchema,
    amenityIdSchema,
    amenityQuerySchema,
} = require("../validators/amenity.validator");

/**
 * Amenity Routes
 * Base path: /api/v1/amenities
 */

// Public routes
router.get("/", validate({ query: amenityQuerySchema }), getAmenities);
router.get("/:id", validate({ params: amenityIdSchema }), getAmenityById);

// Protected routes - Admin only
router.post(
    "/",
    protect,
    allowTo("admin"),
    validate(createAmenitySchema),
    createAmenity
);

router.put(
    "/:id",
    protect,
    allowTo("admin"),
    validate({ params: amenityIdSchema, body: updateAmenitySchema }),
    updateAmenity
);

router.delete(
    "/:id",
    protect,
    allowTo("admin"),
    validate({ params: amenityIdSchema }),
    deleteAmenity
);

module.exports = router;
