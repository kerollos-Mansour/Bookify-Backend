const socketIO = require("socket.io");
const { verifyToken } = require("../shared/utils/token.util");
const { chatHandler } = require("./chatHandler");

const userSocketMap = new Map();
let io;

const initializeSocketIO = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Auth middleware
io.use((socket, next) => {
  try {

      // Try to get token from auth object first
      let token = socket.handshake.auth.token;
      
      // If not in auth, try from authorization header
      if (!token && socket.handshake.headers.authorization) {
        const authHeader = socket.handshake.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
      }

      if (!token) {
        return next(new Error("No token provided"));
      }

      // Use verifyToken function (not verifyAccessToken)
      const decoded = verifyToken(token);
      
      // ✅ Make sure decoded has the expected structure
      console.log("Decoded token:", decoded); // For debugging
      
      socket.userId = decoded.id; // Should be 'id' from your token payload
      next();
    } catch (err) {
    next(new Error("Unauthorized"));
  }
});


  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.userId}`);

    userSocketMap.set(socket.userId, socket.id);

    chatHandler(io, socket);

    socket.on("disconnect", () => {
      userSocketMap.delete(socket.userId);
      console.log(`🔴 User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

module.exports = { initializeSocketIO };
