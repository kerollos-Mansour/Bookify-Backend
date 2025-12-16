const express = require("express");
const router = express.Router();
const {
    createDestination,
    getAllDestinations,
    getDestinationById,
    deleteDestination,
    updateDestination,
} = require("../controller/destinations.controller");
const validate = require("../../../shared/middlewares/validate.middleware");
const { protect, allowTo } = require("../../../shared/middlewares/jwt.middle");
const {
    createDestinationSchema,
    updateDestinationSchema,
    destinationIdSchema,
    destinationQuerySchema,
} = require("../validators/destinations.validator");

// Public routes
router.get(
    "/",
    validate({ query: destinationQuerySchema }),
    getAllDestinations
);
router.get(
    "/:id",
    validate({ params: destinationIdSchema }),
    getDestinationById
);

// Protected routes - Admin only
router.post("/", protect, allowTo("admin"), validate(createDestinationSchema), createDestination);
router.put(
    "/:id",
    protect,
    allowTo("admin"),
    validate({ params: destinationIdSchema, body: updateDestinationSchema }),
    updateDestination
);
router.delete(
    "/:id",
    protect,
    allowTo("admin"),
    validate({ params: destinationIdSchema }),
    deleteDestination
);

module.exports = router;
