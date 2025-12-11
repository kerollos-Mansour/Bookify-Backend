const paymentService = require("../services/payment.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");

/**
 * POST /api/payments
 */
exports.createPayment = catchAsync(async (req, res) => {
  const payment = await paymentService.createPayment(req.user, req.body);
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    message: "Payment created successfully",
    data: payment,
  });
});

/**
 * GET /api/payments/booking/:bookingId
 */
exports.getPaymentByBookingId = catchAsync(async (req, res) => {
  const payment = await paymentService.getPaymentByBookingId(
    req.params.bookingId
  );
  res.status(200).json({ status: httpStatusText.SUCCESS, data: payment });
});

/**
 * PUT /api/payments/:id/status (Admin)
 */
exports.updatePaymentStatus = catchAsync(async (req, res) => {
  const payment = await paymentService.updatePaymentStatus(
    req.user,
    req.params.id,
    req.body.status
  );
  res.status(200).json({ status: httpStatusText.SUCCESS, data: payment });
});
