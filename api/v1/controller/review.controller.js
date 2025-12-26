const reviewService = require("../services/review.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");



const createReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.createReview(req.body);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { review }
  });
});


const getAllReviews = catchAsync(async (req, res, next) => {
  const filters = req.query.filters ? JSON.parse(req.query.filters) : {};
  const pagination = req.query.pagination ? JSON.parse(req.query.pagination) : {};
  const sorting = req.query.sorting ? JSON.parse(req.query.sorting) : {};

  const result = await reviewService.getAllReviews(filters, pagination, sorting);

  res.status(200).json({
    status: "success",
    data: result.reviews,
    pagination: result.pagination,
  });
});


const getReviewById = catchAsync(async (req, res, next) => {
  const review = await reviewService.getReviewById(req.params.id);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { review }
  });
});


const updateReview = catchAsync(async (req, res, next) => {
  const updatedReview = await reviewService.updateReview(req.params.id, req.body);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { review: updatedReview }
  });
});

const deleteReview = catchAsync(async (req, res, next) => {
  await reviewService.deleteReview(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
module.exports = {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  getReviewById

};
