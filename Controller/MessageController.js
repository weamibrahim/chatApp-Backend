const Message = require("../Models/Message");

const MessageController = {};
MessageController.getConversationMessages = async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 }).populate("senderId receiverId", "_id name  profileImage");

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = MessageController;
