const express = require("express");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role, subjects } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email,
      password,
      role,
      subjects,
    });
    user.save();
    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d", // Token valid for 7 days
      }
    );

    // Send response (excluding password)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    // console.log(user);
    res.status(201).json([
      { message: "User registered successfully" },
      {
        user: user,
      },
    ]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare entered password with stored hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d", // Token valid for 7 days
      }
    );

    // Send response (excluding password)
    // res.cookie("token", token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

authRouter.post("/logout", (req, res) => {
  // res.cookie("token", null, { expires: new Date(Date.now()) });
  // res.send("logout successfully");

  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
    expires: new Date(0), // Expire immediately
  });
  res.send("logout successfully");
});

module.exports = authRouter;
