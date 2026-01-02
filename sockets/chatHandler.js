const Message = require("../shared/models/message.model");

// Simple helper to create a unique room between 2 users
const createRoom = (user1, user2) => {
  return [user1, user2].sort().join("_");
};

exports.chatHandler = (io, socket) => {

  // Join chat
  socket.on("chat:join", async ({ receiverId }) => {
    if (!receiverId) return;

    const room = createRoom(socket.userId, receiverId);
    socket.join(room);

    console.log(`👤 ${socket.userId} joined room ${room}`);

    // ✅ Fetch and send chat history
    try {
      const messages = await Message.find({ room })
        .sort({ createdAt: 1 })
        .limit(50)
        .lean();

      socket.emit("chat:history", messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      socket.emit("chat:history", []);
    }

    socket.emit("chat:joined", { room });
  });
  // Send message
  socket.on("chat:message", async ({ receiverId, content }) => {
    if (!receiverId || !content) return;

    const room = createRoom(socket.userId, receiverId);

    // Save message to database
    const newMessage = await Message.create({
      senderId: socket.userId,
      receiverId,
      content,
      room,
    });

    const message = {
      _id: newMessage._id,
      senderId: socket.userId,
      receiverId,
      content,
      createdAt: newMessage.createdAt,
    };

    io.to(room).emit("chat:message", message);

    console.log(`💬 ${socket.userId} → ${receiverId}: ${content}`);

    // ✅ Send notification if receiver is not in the room or offline
    const { sendNotificationToUser } = require("./index");
    const receiverSockets = await io.in(room).fetchSockets();
    const receiverInRoom = receiverSockets.some(s => s.userId === receiverId);

    if (!receiverInRoom) {
      await sendNotificationToUser(receiverId, {
        type: "message",
        title: "New Message",
        message: `${socket.username}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        data: { senderId: socket.userId, messageId: newMessage._id },
      });
    }
  });


  // Typing indicator
  socket.on("chat:typing", ({ receiverId, isTyping }) => {
    const room = createRoom(socket.userId, receiverId);

    socket.to(room).emit("chat:typing", {
      userId: socket.userId,
      isTyping,
    });
  });

};
