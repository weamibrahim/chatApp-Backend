const socketIO = require('socket.io');
const User = require('./Models/User'); 
const Message = require('./Models/Message'); 

module.exports = function (server) {
  const io = socketIO(server, {
    cors: {
      origin: [
        'http://localhost:5173', // Local frontend
        
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async (userId) => {
      socket.join(userId);
      socket.userId = userId;
      await User.findByIdAndUpdate(userId, { status: "online" });
      io.emit('updateUserStatus', { userId, status: "online" });
    });

    // Listen for sending a message from the client
    socket.on('sendMessage', async (messageData) => {
      const { senderId, receiverId, message } = messageData;

      try {
        const newMessage = new Message({ senderId, receiverId, message });
        await newMessage.save();

        // Emit the new message to the sender and receiver
        io.to(senderId).emit('newMessage', newMessage);
        io.to(receiverId).emit('newMessage', newMessage);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    // Handle user logout
    socket.on('logout', async (userId) => {
      await User.findByIdAndUpdate(userId, { status: "offline" });
      io.emit('updateUserStatus', { userId, status: "offline" });
    });

    // Handle user disconnect
    socket.on('disconnect', async () => {
      const userId = socket.userId;
      if (userId) {
        await User.findByIdAndUpdate(userId, { status: "offline" });
        io.emit('updateUserStatus', { userId, status: "offline" });
      }
    });
  });

  return io;
};
