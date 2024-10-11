const socketIO = require("socket.io");
const User = require("./Models/User");
const Message = require("./Models/Message");

module.exports = function (server) {
  const io = socketIO(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", async (userId) => {
      try {
        socket.join(userId);
        socket.userId = userId;
        await User.findByIdAndUpdate(userId, { status: "online" });
        io.emit("updateUserStatus", { userId, status: "online" });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("getusers", async (userId) => {
      try {
        console.log("userid", userId);
        const allUsers = await User.find({ _id: { $ne: userId } });
       // console.log(allUsers);
        socket.emit("users", allUsers);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Listen for sending a message from the client
    socket.on("sendMessage", async (messageData) => {
      const { senderId, receiverId, message } = messageData;

      try {
        const newMessage = new Message({ senderId, receiverId, message });
        await newMessage.save();

        // Emit the new message to the sender and receiver
        io.to(senderId).emit("newMessage", newMessage);
        io.to(receiverId).emit("newMessage", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("typing", (data) => {
      try {
        const { receiverId } = data;
        io.to(receiverId).emit("userTyping");
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

   socket.on("updateMessage", async (data) => {
    console.log("data", data);
      try {
        const { messageId,senderId, message } = data;
        const oldMessage = await Message.findById(messageId);

       // console.log("message", oldMessage);
        if (oldMessage.senderId.toString() === senderId) {
         const newMessage = await Message.findByIdAndUpdate(messageId, { message }, { new: true });

          console.log("newMessage", newMessage);

          io.emit("messageUpdate", { messageId, message });
        } else {
          socket.emit("notAuthorized", {
            message: "You are not authorized to update this message.",
          });
        }
      
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });
       
    socket.on("deleteMessage", async (data) => {
      try {
        console.log("data", data);

        const { messageId, senderId } = data;
        const message = await Message.findById(messageId);

        console.log("message", message.senderId.toString(), senderId);

        if (message.senderId.toString() === senderId) {
          await Message.findByIdAndDelete(messageId);
          io.emit("messageDelete", messageId);
        } else {
          socket.emit("notAuthorized", {
            message: "You are not authorized to delete this message.",
          });
        }
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Handle user logout
    socket.on("logout", async (userId) => {
      try {
        await User.findByIdAndUpdate(userId, { status: "offline" });
        io.emit("updateUserStatus", { userId, status: "offline" });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Handle user disconnect
    socket.on("disconnect", async () => {
      try {
        const userId = socket.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, { status: "offline" });
          io.emit("updateUserStatus", { userId, status: "offline" });
        }
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });
  });

  return io;
};
