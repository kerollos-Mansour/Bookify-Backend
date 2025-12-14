const Coupons = require("../../../shared/models/coupons.model");

exports.createCoupon = async (req, res, next) => {
  try {
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
    } = req.body;
    
    if (!code || !discountType || !discountValue || !validTo) {
      return res.status(400).json({
        success: false,
        message: "Code, discountType, discountValue, and validTo are required",
      });
    }
    //Checking if the code is existing
    const isExsisting = await Coupons.findOne({ code });
    if (isExsisting) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }
    if (new Date(validTo) <= new Date(validFrom)) {
      return res.status(400).json({
        success: false,
        message: "ValidTo date must be after validFrom date",
      });
    }
    // Create new coupon
    const coupon = new Coupons({
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

    await coupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (err) {
    console.error("Error:", err);

    // Add better error handling
    if (err.name === "ValidationError") {
      const missingFields = Object.keys(err.errors).join(", ");
      return res.status(400).json({
        success: false,
        message: `Validation failed. Missing: ${missingFields}`,
        errors: Object.values(err.errors).map((e) => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating coupon",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

exports.getCoupons = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      isActive,
      discountType,
      search,
    } = req.query;

    const query = {};

    if (!isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    if (discountType) {
      query.discountType = discountType;
    }
    const coupons = await Coupons.find();
    res.status(200).json(coupons);
  } catch (err) {
    console.error("Error getting coupons:", err);
    res.status(500).json({
      success: false,
      message: "Error retrieving coupons",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
exports.getCouponsById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupons.findById(id);
    if (!coupon) {
      return res.stauts(404).json({
        success: false,
        message: "Coupon not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Coupon retrieved successfully",
      date: coupon,
    });
  } catch (err) {
    console.error("Error getting coupon:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error retrieving coupon",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { _id } = req.params;

    const coupon = await Coupons.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
      data: coupon,
    });
  } catch (err) {
    console.error("Error deleting coupon:", err);

    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error deleting coupon",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
