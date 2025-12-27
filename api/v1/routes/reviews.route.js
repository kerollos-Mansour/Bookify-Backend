const reviewController = require("../controller/review.controller");
const express = require("express");
const router = express.Router();



router.get("/", reviewController.getAllReviews);

router.get("/:id", reviewController.getReviewById);

router.post("/", reviewController.createReview);

router.put("/:id", reviewController.updateReview);

// Moderation routes
router.patch("/:id/approve", reviewController.approveReview);
router.patch("/:id/reject", reviewController.rejectReview);

router.delete("/:id", reviewController.deleteReview);

module.exports = router;
