const express = require("express");
const router = express.Router();
const upload = require('../Middelware/UploadImage'); // Import the Multer middleware
const  verifyToken= require('../Middelware/Authentication');
// Import the UserController
const UserController = require("../Controller/UserController");

// Define the routes
router.get("/:userId",verifyToken, UserController.getAllUsers);
router.get("/user/:id",verifyToken, UserController.getUser);
router.post("/register",upload.single("image"), UserController.register);
router.post("/login", UserController.login);
router.put("/:id",verifyToken,upload.single("image"), UserController.updateUser);
router.delete("/:id",verifyToken, UserController.deleteUser);

// Export the router
module.exports = router;