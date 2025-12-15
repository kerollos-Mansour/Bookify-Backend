const express = require("express");
const router = express.Router();
const couponsController = require("../../v1/controller/coupons.controller");
const { get } = require("mongoose");

router.post("/", couponsController.createCoupon);
router.get("/", couponsController.getCoupons);
router.get("/:id", couponsController.getCouponsById);
router.delete("/:id", couponsController.deleteCoupon);

module.exports = router;
