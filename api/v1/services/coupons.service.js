const Coupons = require("../../../shared/models/coupons.model");
const AppError = require("../../../shared/utils/appError.utils");

/**
 * Create a new coupon
 */
exports.createCoupon = async (couponData) => {
    const {
        code,
        discountType = "percentage",
        discountValue = 0,
        validFrom = Date.now(),
        validTo,
        minOrderAmount = 0,
        maxDiscountAmount,
        usageLimit = 1,
        description = "",
        isActive = true,
    } = couponData;

    // Validation
    if (!code || !discountType || !discountValue || !validTo) {
        throw new AppError(
            "Code, discountType, discountValue, and validTo are required",
            400
        );
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupons.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
        throw new AppError("Coupon code already exists", 400);
    }

    // Validate date range
    if (new Date(validTo) <= new Date(validFrom)) {
        throw new AppError("ValidTo date must be after validFrom date", 400);
    }

    // Create new coupon
    const coupon = await Coupons.create({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        validFrom,
        validTo,
        minOrderAmount,
        maxDiscountAmount,
        usageLimit,
        currentUsage: 0,
        description,
        isActive,
    });

    return coupon;
};

/**
 * Get all coupons with filtering
 */
exports.getCoupons = async (queryParams) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        isActive,
        discountType,
        search,
    } = queryParams;

    const query = {};

    // Filter by active status
    if (isActive !== undefined) {
        query.isActive = isActive === "true";
    }

    // Filter by discount type
    if (discountType) {
        query.discountType = discountType;
    }

    // Search by code
    if (search) {
        query.code = { $regex: search, $options: "i" };
    }

    const coupons = await Coupons.find(query)
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Coupons.countDocuments(query);

    return {
        coupons,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get a coupon by ID
 */
exports.getCouponById = async (id) => {
    const coupon = await Coupons.findById(id);

    if (!coupon) {
        throw new AppError("Coupon not found", 404);
    }

    return coupon;
};

/**
 * Update a coupon by ID
 */
exports.updateCoupon = async (id, updateData) => {
    const coupon = await Coupons.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    if (!coupon) {
        throw new AppError("Coupon not found", 404);
    }

    return coupon;
};

/**
 * Delete a coupon by ID
 */
exports.deleteCoupon = async (id) => {
    const coupon = await Coupons.findByIdAndDelete(id);

    if (!coupon) {
        throw new AppError("Coupon not found", 404);
    }

    return coupon;
};
