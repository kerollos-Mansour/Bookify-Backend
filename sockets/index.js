const socketIO = require("socket.io");
const { verifyToken } = require("../shared/utils/token.util");
const { chatHandler } = require("./chatHandler");
const User = require("../shared/models/user.model"); // ✅ Add this import

// ✅ Store full user info, not just socketId
const activeUsers = new Map();
let io;

const initializeSocketIO = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // ✅ Auth middleware - fetch user data
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

      console.log("Decoded token:", decoded);

      // ✅ Fetch user from database to get username
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return next(new Error("User not found"));
      }

      // ✅ Attach user info to socket
      socket.userId = user._id.toString();
      socket.username = user.username;
      socket.userEmail = user.email;
      socket.userRole = user.role;

      next();
    } catch (err) {
      console.error("Auth error:", err);
      next(new Error("Unauthorized"));
    }
  });

  // ✅ Connection handler
  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.username} (${socket.userId})`);

    // ✅ Store FULL user info in Map
    activeUsers.set(socket.userId, {
      userId: socket.userId,
      socketId: socket.id,
      username: socket.username,
      email: socket.userEmail,
      role: socket.userRole,
    });

    // ✅ BROADCAST USER LIST TO ALL CLIENTS!
    broadcastUserList();

    // Register chat handlers
    chatHandler(io, socket);

    // ✅ Handle disconnect
    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${socket.username} (${socket.userId})`);
      
      // ✅ Remove from active users
      activeUsers.delete(socket.userId);
      
      // ✅ Broadcast updated list
      broadcastUserList();
    });
  });

  return io;
};

// ✅ ADD THIS FUNCTION - This is what was missing!
const broadcastUserList = () => {
  const userList = Array.from(activeUsers.values());
  
  console.log(`📢 Broadcasting user list: ${userList.length} users`);
  console.log(userList.map(u => `${u.username} (${u.userId})`));
  
  io.emit("update_user_list", userList);
};

// ✅ Export helper to get socket by userId (useful for direct messages)
const getSocketByUserId = (userId) => {
  const user = activeUsers.get(userId);
  return user ? user.socketId : null;
};

module.exports = { 
  initializeSocketIO, 
  activeUsers,
  getSocketByUserId 
};