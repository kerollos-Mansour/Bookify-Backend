const couponsService = require("../services/coupons.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const AppError = require("../../../shared/utils/appError.utils");

/**
 * Create a new coupon
 * POST /api/v1/coupons
 */
exports.createCoupon = catchAsync(async (req, res, next) => {
  const coupon = await couponsService.createCoupon(req.body);

  res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    data: coupon,
  });
});

/**
 * Get all coupons with filtering and pagination
 * GET /api/v1/coupons?page=1&limit=10&isActive=true&discountType=percentage&search=SAVE
 */
exports.getCoupons = catchAsync(async (req, res, next) => {
  const result = await couponsService.getCoupons(req.query);

  res.status(200).json({
    success: true,
    data: {
      coupons: result.coupons,
      page: result.pagination.page,
      totalPages: result.pagination.totalPages,
      totalCoupons: result.pagination.total,
    },
  });
});

/**
 * Get a single coupon by ID
 * GET /api/v1/coupons/:id
 */
exports.getCouponsById = catchAsync(async (req, res, next) => {
  const coupon = await couponsService.getCouponById(req.params.id);

  res.status(200).json({
    success: true,
    message: "Coupon retrieved successfully",
    data: coupon,
  });
});

/**
 * Update a coupon by ID
 * PUT /api/v1/coupons/:id
 */
exports.updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await couponsService.updateCoupon(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Coupon updated successfully",
    data: coupon,
  });
});

/**
 * Delete a coupon by ID
 * DELETE /api/v1/coupons/:id
 */
exports.deleteCoupon = catchAsync(async (req, res, next) => {
  await couponsService.deleteCoupon(req.params.id);

  res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
  });
});

