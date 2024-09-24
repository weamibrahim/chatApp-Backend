const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserController = {};

// Register a new user
UserController.register = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
   const hashedPassword = await bcrypt.hash(password, 10);
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path;
    }
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profileImage: imageUrl, 
    });
    await newUser.save();
    res.status(201).json({ newUser, message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login a user
UserController.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    // Update user status
    user.status = "online";
    await user.save();

    res.status(200).json({ user, message: "Login successful", accessToken });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users
UserController.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.userId } });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get a reciverUser
UserController.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-_id name status");
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Update a user
UserController.updateUser = async (req, res) => {
  try {
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = req.file.path;
    }
    const updatedInfo = { ...req.body, profileImage: imageUrl };
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedInfo,
      {
        new: true,
      }
    );
    res.json({ updatedUser, message: "User updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a user
UserController.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.json(deletedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = UserController;
