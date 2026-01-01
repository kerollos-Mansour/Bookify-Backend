const reviewService = require("../services/review.service");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");
const { sendNotificationToUser } = require("../../../sockets");



const createReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.createReview(req.body);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: { review }
  });
});


const getAllReviews = catchAsync(async (req, res, next) => {
  const filters = req.query.filters ? JSON.parse(req.query.filters) : (req.query.status ? { status: req.query.status } : {});
  const pagination = req.query.pagination ? JSON.parse(req.query.pagination) : { page: req.query.page, limit: req.query.limit };
  const sorting = req.query.sorting ? JSON.parse(req.query.sorting) : { sort: req.query.sort };

  const result = await reviewService.getAllReviews(filters, pagination, sorting);

  res.status(200).json({
    status: httpStatusText.SUCCESS,
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


const approveReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.approveReview(req.params.id);

  if (review && review.userId) {
    await sendNotificationToUser(review.userId, {
      type: "update",
      title: "Review Published",
      message: "Your review has been approved and is now live.",
      data: { reviewId: review._id },
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { review }
  });
});

const rejectReview = catchAsync(async (req, res, next) => {
  const review = await reviewService.rejectReview(req.params.id);

  if (review && review.userId) {
    await sendNotificationToUser(review.userId, {
      type: "update",
      title: "Review Rejected",
      message: "Your review has been rejected as it violates our guidelines.",
      data: { reviewId: review._id },
    });
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: { review }
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
  getReviewById,
  updateReview,
  approveReview,
  rejectReview,
  deleteReview,
};