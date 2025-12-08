const express = require("express");
const router = express.Router();
const {
  createDestination,
  getAllDestinations,
  getDestinationById,
  deleteDestination,
  updateDestination,
} = require("../controller/destinations.controller");

// post new destination
router.post("/", createDestination);
router.get("/", getAllDestinations);
router.get("/:id", getDestinationById);
router.delete("/:id", deleteDestination);
router.put("/:id", updateDestination);

module.exports = router;
