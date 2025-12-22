const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentStripe.controller");
const authMiddleware = require("../../../shared/middlewares/auth.middleware");

router.post(
  "/create-intent",
  authMiddleware.protect,
  paymentController.createStripePaymentIntent
);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhook
);

module.exports = router;
