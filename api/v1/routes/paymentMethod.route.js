const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentMethod.controller");
const authMiddleware = require("../../../shared/middlewares/auth.middleware");

router.post("/", authMiddleware.protect, paymentController.createPaymentMethod);
router.get("/", authMiddleware.protect, paymentController.getPaymentMethods);
router.delete(
  "/:id",
  authMiddleware.protect,
  paymentController.deletePaymentMethod
);

module.exports = router;
