const express = require("express");
const router = express.Router();

// Import the MessageController
const MessageController = require("../Controller/MessageController");
const  verifyToken= require('../Middelware/Authentication');

// Define the routes
router.get("/:userId/:otherUserId",verifyToken,MessageController.getConversationMessages);


// Export the router
module.exports = router;