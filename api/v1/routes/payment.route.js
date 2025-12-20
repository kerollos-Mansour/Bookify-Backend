const express = require("express");
const router = express.Router();
const paymentController = require("../controller/payment.controller");
const authMiddleware = require("../../../shared/middlewares/auth.middleware");

router.post("/", authMiddleware.protect, paymentController.createPayment);

router.get(
  "/booking/:bookingId",
  authMiddleware.protect,
  paymentController.getPaymentByBookingId
);

router.put(
  "/:id/status",
  authMiddleware.protect,
  authMiddleware.restrictToAdmin,
  paymentController.updatePaymentStatus
);

module.exports = router;
