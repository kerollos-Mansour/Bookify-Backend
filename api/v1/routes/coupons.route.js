const express = require("express");
const router = express.Router();
const couponsController = require("../../v1/controller/coupons.controller");
const validate = require("../../../shared/middlewares/validate.middleware");
const { protect } = require("../../../shared/middlewares/jwt.middleware");
const {
    createCouponsSchema,
    updateCouponsSchema,
    couponIdSchema,
} = require("../validators/coupons.validator");

// Public routes
router.get("/", couponsController.getCoupons);
router.get(
    "/:id",
    validate({ params: couponIdSchema }),
    couponsController.getCouponsById
);

// Protected routes
router.post(
    "/",
    protect,
    validate(createCouponsSchema),
    couponsController.createCoupon
);
router.put(
    "/:id",
    protect,
    validate({ params: couponIdSchema, body: updateCouponsSchema }),
    couponsController.getCouponsById
);
router.delete(
    "/:id",
    protect,
    validate({ params: couponIdSchema }),
    couponsController.getCouponsById
);

module.exports = router;
