const amenityController = require("../controller/amenity.controller");
const express = require("express");
const router = express.Router();

/**
 * Amenity Routes
 * Base path: /api/v1/amenities
 */

// Get all amenities with optional filtering
router.get("/", amenityController.getAmenities);

// Get amenity by ID
router.get("/:id", amenityController.getAmenityById);

// Create new amenity
router.post("/", amenityController.createAmenity);

// Update amenity
router.put("/:id", amenityController.updateAmenity);

// Delete amenity
router.delete("/:id", amenityController.deleteAmenity);

module.exports = router;
