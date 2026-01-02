const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification.controller");
// const { verifyToken } = require("../shared/middlewares/jwt.middleware");

// All routes require authentication
// router.use(verifyToken);

// Get user's notifications (paginated)
router.get("/", notificationController.getUserNotifications);

// Mark all as read
router.patch("/mark-all-read", notificationController.markAllAsRead);

// Mark specific notification as read
router.patch("/:id/read", notificationController.markAsRead);

// Delete notification
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
