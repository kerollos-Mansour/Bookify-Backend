const socketIO = require("socket.io");
const { verifyToken } = require("../shared/utils/token.util");
const { chatHandler } = require("./chatHandler");
const { notificationHandler } = require("./notificationHandler");
const User = require("../shared/models/user.model");

// Store full user info
const activeUsers = new Map();
let io;

const initializeSocketIO = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth.token;

      if (!token && socket.handshake.headers.authorization) {
        const authHeader = socket.handshake.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return next(new Error("No token provided"));
      }

      let decoded;
      try {
        decoded = verifyToken(token);
      } catch (error) {
        return next(new Error("Invalid token"));
      }

      // Fetch user from database
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach user info to socket
      socket.userId = user._id.toString();
      socket.username = user.username;
      socket.userEmail = user.email;
      socket.userRole = user.role; // e.g., 'user', 'vendor', 'admin'

      next();
    } catch (err) {
      console.error("Auth error:", err);
      next(new Error("Unauthorized"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.username} (${socket.userId}) [${socket.userRole}]`);

    // Store FULL user info in Map
    activeUsers.set(socket.userId, {
      userId: socket.userId,
      socketId: socket.id,
      username: socket.username,
      email: socket.userEmail,
      role: socket.userRole,
    });

    // Broadcast user list (optional, maybe restrict to admins later)
    broadcastUserList();

    // Register handlers
    chatHandler(io, socket);
    notificationHandler(io, socket);

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.username} (${socket.userId})`);
      activeUsers.delete(socket.userId);
      broadcastUserList();
    });
  });

  return io;
};

const broadcastUserList = () => {
  const userList = Array.from(activeUsers.values());
  io.emit("update_user_list", userList);
};

const Notification = require("../shared/models/notification.model");


/**
 * Send a notification to a specific user by ID and SAVE to DB
 */
const sendNotificationToUser = async (userId, data) => {
  try {
    // 1. Save to DB
    const notification = await Notification.create({
      recipientId: userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
    });

    // 2. Emit if online
    if (io) {
      const user = activeUsers.get(userId.toString());
      if (user) {
        io.to(user.socketId).emit("new_notification", notification);
        return true;
      }
    }
    return false; // User offline, but saved to DB
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
};

/**
 * Send a notification to all users with a specific role
 */
const sendNotificationToRole = async (role, data) => {
  try {
    // 1. Find all users with this role to save to DB (This might be heavy if many users, optimize later)
    const users = await User.find({ role }).select("_id");

    if (users.length === 0) return;

    const notifications = users.map(u => ({
      recipientId: u._id,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data || {},
    }));

    // Bulk insert
    const savedNotifications = await Notification.insertMany(notifications);

    // 2. Emit to online users
    if (io) {
      savedNotifications.forEach(notif => {
        const user = activeUsers.get(notif.recipientId.toString());
        if (user) {
          io.to(user.socketId).emit("new_notification", notif);
        }
      });
    }
  } catch (error) {
    console.error("Error sending notification to role:", error);
  }
};

const getSocketByUserId = (userId) => {
  const user = activeUsers.get(userId);
  return user ? user.socketId : null;
};

module.exports = {
  initializeSocketIO,
  activeUsers,
  getSocketByUserId,
  sendNotificationToUser,
  sendNotificationToRole
};