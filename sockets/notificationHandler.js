const Notification = require("../shared/models/notification.model");

const notificationHandler = (io, socket) => {

    // ✅ Fetch unread notifications on connect/join
    socket.on("notification:join", async () => {
        try {
            const notifications = await Notification.find({
                recipientId: socket.userId
            })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            socket.emit("notification:history", notifications);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    });

    // ✅ Mark as specific notification as read
    socket.on("notification:mark_read", async (notificationId) => {
        try {
            await Notification.findByIdAndUpdate(notificationId, { read: true });
            socket.emit("notification:updated", { id: notificationId, read: true });
        } catch (error) {
            console.error("Error marking notification read:", error);
        }
    });

    // ✅ Mark ALL as read
    socket.on("notification:mark_all_read", async () => {
        try {
            await Notification.updateMany(
                { recipientId: socket.userId, read: false },
                { read: true }
            );
            socket.emit("notification:all_read");
        } catch (error) {
            console.error("Error marking all read:", error);
        }
    });
};

module.exports = { notificationHandler };
