const User = require('../models/User'); // Your existing User model
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Store active user connections: {userId: socketId}
  const activeUsers = new Map();
  
  // Simple authentication middleware
  io.use(async (socket, next) => {
    try {
      // Get token from handshake
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('No token provided'));
      }
      
      // Verify token (using your existing JWT setup)
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Find user in database
      const user = await User.findById(decoded.id || decoded.userId || decoded._id);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user info to socket
      socket.user = {
        id: user._id,
        username: user.username || user.email,
        name: user.name || user.username
      };
      
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });
  
  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user.id})`);
    
    // Store user as active
    activeUsers.set(socket.user.id, socket.id);
    
    // Notify user of successful connection
    socket.emit('connected', {
      message: 'Connected to chat server',
      userId: socket.user.id,
      usersOnline: activeUsers.size
    });
    
    // Send list of online users (excluding self)
    const onlineUsersList = [];
    activeUsers.forEach((socketId, userId) => {
      if (userId !== socket.user.id) {
        onlineUsersList.push({ userId, socketId });
      }
    });
    socket.emit('online-users', onlineUsersList);
    
    // **Simple Message Events**
    
    // 1. Send direct message to another user
    socket.on('direct-message', async (data) => {
      const { toUserId, message } = data;
      
      if (!toUserId || !message) {
        return socket.emit('error', { message: 'Missing recipient or message' });
      }
      
      // Check if recipient is online
      const recipientSocketId = activeUsers.get(toUserId);
      
      if (recipientSocketId) {
        // Create message object
        const messageData = {
          from: socket.user.id,
          fromName: socket.user.username,
          to: toUserId,
          message: message,
          timestamp: new Date().toISOString()
        };
        
        // Send to recipient
        io.to(recipientSocketId).emit('new-message', messageData);
        
        // Also send to sender for UI update
        socket.emit('message-sent', {
          ...messageData,
          delivered: true
        });
        
        console.log(`Message sent from ${socket.user.id} to ${toUserId}: ${message}`);
        
        // **Optional**: Save to database
        // await saveMessage(messageData);
      } else {
        // Recipient is offline
        socket.emit('message-sent', {
          from: socket.user.id,
          to: toUserId,
          message: message,
          timestamp: new Date().toISOString(),
          delivered: false,
          error: 'User is offline'
        });
        
        // **Optional**: Save to database with pending flag
        // await saveMessage({...messageData, status: 'pending'});
      }
    });
    
    // 2. Typing indicator
    socket.on('typing', (data) => {
      const { toUserId, isTyping } = data;
      const recipientSocketId = activeUsers.get(toUserId);
      
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('user-typing', {
          userId: socket.user.id,
          username: socket.user.username,
          isTyping: isTyping
        });
      }
    });
    
    // 3. Message read receipt
    socket.on('message-read', (data) => {
      const { messageId, fromUserId } = data;
      const senderSocketId = activeUsers.get(fromUserId);
      
      if (senderSocketId) {
        io.to(senderSocketId).emit('message-read', {
          messageId: messageId,
          readBy: socket.user.id,
          readAt: new Date().toISOString()
        });
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
      
      // Remove from active users
      activeUsers.delete(socket.user.id);
      
      // Notify other users (optional)
      socket.broadcast.emit('user-offline', {
        userId: socket.user.id,
        username: socket.user.username
      });
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.user.username}:`, error);
    });
  });
  
  console.log('Simple chat module loaded');
};

// Optional: Database message saving function
async function saveMessage(messageData) {
  // If you want to save messages immediately
  try {
    // Example: Save to MongoDB
    // const ChatMessage = require('../models/ChatMessage');
    // const saved = await ChatMessage.create({
    //   sender: messageData.from,
    //   receiver: messageData.to,
    //   content: messageData.message,
    //   timestamp: messageData.timestamp,
    //   status: 'delivered'
    // });
    // return saved;
  } catch (error) {
    console.error('Error saving message:', error);
  }
}