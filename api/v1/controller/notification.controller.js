const Notification = require("../../../shared/models/notification.model");
const catchAsync = require("../../../shared/utils/catchError.utils");
const httpStatusText = require("../../../shared/utils/appError.utils");

/**
 * Get all notifications for the logged-in user
 * GET /api/v1/notifications
 * Protected route: user must be logged in
 */
exports.getUserNotifications = catchAsync(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
        recipientId: req.user._id,
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Notification.countDocuments({
        recipientId: req.user._id,
    });

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: notifications,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

/**
 * Mark a notification as read
 * PATCH /api/v1/notifications/:id/read
 * Protected route: user must be logged in
 */
exports.markAsRead = catchAsync(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        {
            _id: req.params.id,
            recipientId: req.user._id, // Ensure user owns this notification
        },
        { read: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({
            status: httpStatusText.FAIL,
            message: "Notification not found",
        });
    }

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: notification,
    });
});

/**
 * Delete a notification
 * DELETE /api/v1/notifications/:id
 * Protected route: user must be logged in
 */
exports.deleteNotification = catchAsync(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
        _id: req.params.id,
        recipientId: req.user._id, // Ensure user owns this notification
    });

    if (!notification) {
        return res.status(404).json({
            status: httpStatusText.FAIL,
            message: "Notification not found",
        });
    }

    res.status(204).json({
        status: httpStatusText.SUCCESS,
        data: null,
    });
});

/**
 * Mark all notifications as read
 * PATCH /api/v1/notifications/mark-all-read
 * Protected route: user must be logged in
 */
exports.markAllAsRead = catchAsync(async (req, res) => {
    await Notification.updateMany(
        { recipientId: req.user._id, read: false },
        { read: true }
    );

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        message: "All notifications marked as read",
    });
});
