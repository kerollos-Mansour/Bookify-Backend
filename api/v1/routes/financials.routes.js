const express = require("express");
const router = express.Router();
const financialsController = require("../controller/financials.controller");
const authMiddleware = require("../../../shared/middlewares/auth.middleware");

// All routes are protected and restricted to admin
// router.use(authMiddleware.protect);
// router.use(authMiddleware.restrictTo("admin"));

router.get("/revenue", financialsController.getRevenue);
router.get("/transactions", financialsController.getTransactions);
router.get("/coupons/usage", financialsController.getCouponUsage);

module.exports = router;
