const Reviews = require("../../../shared/models/review.model");
const mongoose = require("mongoose");
const AppError = require("../../../shared/utils/appError.utils");


//  * Create a new review
const createReview = async (data) => {
  const review = new Review(data);
  await review.save();
  return review;
};

//  * Get all reviews with filtering, pagination, and sorting
const getAllReviews = async (filters = {}, pagination = {}, sorting = {}) => {
  const page = Number(pagination.page) || 1;
  const limit = Number(pagination.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter query
  const query = {};

  if (filters.hotelid) {
    query.hotelid = filters.hotelid;
  }

  if (filters.userid) {
    query.userid = filters.userid;
  }

  if (filters.minRating) {
    query.rating = { ...query.rating, $gte: Number(filters.minRating) };
  }

  if (filters.maxRating) {
    query.rating = { ...query.rating, $lte: Number(filters.maxRating) };
  }

  if (filters.search) {
    query.comment = { $regex: filters.search, $options: "i" };
  }

  // Build sort object
  const sort = {};
  if (sorting.sort === "rating") {
    sort.rating = 1;
  } else if (sorting.sort === "-rating") {
    sort.rating = -1;
  } else if (sorting.sort === "helpful") {
    sort.helpfulCount = -1;
  } else {
    sort.reviewDate = -1;
  }

  // Execute queries
  const reviews = await Review.find(query).sort(sort).skip(skip).limit(limit);
  const total = await Review.countDocuments(query);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

//  * Get a single review by ID
const getReviewById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid review ID", 400);
  }

  const review = await Review.findById(id);

  if (!review) {
    throw new AppError("Review not found", 404);
  }

  return review;
};

//  * Update a review by ID
const updateReview = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid review ID", 400);
  }

  const updatedReview = await Review.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!updatedReview) {
    throw new AppError("Review not found", 404);
  }

  return updatedReview;
};

//  * Delete a review by ID
const deleteReview = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid review ID", 400);
  }

  const deletedReview = await Review.findByIdAndDelete(id);

  if (!deletedReview) {
    throw new AppError("Review not found", 404);
  }

  return deletedReview;
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
