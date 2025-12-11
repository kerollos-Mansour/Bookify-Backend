const paymentService = require("../services/paymentMethod.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");

/**
 * Create a new payment method for the logged-in user
 * POST /api/v1/payment-methods
 * Protected route: user must be logged in
 */
exports.createPaymentMethod = catchAsync(async (req, res) => {
  const method = await paymentService.createPaymentMethod(req.user, req.body);
  res.status(201).json({ status: httpStatusText.SUCCESS, data: method });
});

/**
 * Get all payment methods for the logged-in user
 * GET /api/v1/payment-methods
 * Protected route: user must be logged in
 */
exports.getPaymentMethods = catchAsync(async (req, res) => {
  const methods = await paymentService.getUserPaymentMethods(req.user);
  res.status(200).json({ status: httpStatusText.SUCCESS, data: methods });
});

/**
 * Delete a payment method by ID
 * DELETE /api/v1/payment-methods/:id
 * Protected route: user must be logged in
 * Users can delete only their own payment methods
 */
exports.deletePaymentMethod = catchAsync(async (req, res) => {
  const method = await paymentService.deletePaymentMethod(
    req.user,
    req.params.id
  );
  res.status(200).json({ status: httpStatusText.SUCCESS, data: method });
});
