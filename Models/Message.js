const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderId: {
        type: require("mongoose").Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: require("mongoose").Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    }
},{
    timestamps:true
});                        
module.exports = mongoose.model("Message", messageSchema)