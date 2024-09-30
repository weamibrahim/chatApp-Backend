const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
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
// forgot password
UserController.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  
  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    console.log(resetToken);
    const resetLink = `${process.env.CLIENT_URL}/resetPassword/${resetToken}`;
    console.log(resetLink);

    // Send reset email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      to: email,
      subject: 'Password Reset',
      html: `<p>Click the following link to reset your password: <a href="${resetLink}">Reset Password</a></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message:'Email sent successfully'});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// reset password
UserController.resetPassword = async (req, res) => {
  
  try {
    console.log(req.body);
    const { password } = req.body;
console.log(password);
   const userId = req.user.userId;
   console.log("userId",userId);
 
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );
    console.log(updatedUser);
    res.json({ updatedUser, message: "Password updated successfully" });
  } catch (error) {
   
    console.log('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
module.exports = UserController;
