const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User.js');
const verifyToken = require("../middlewares/auth.js");

const router = express.Router(); 

const JWT_SECRET = process.env.JWT_SECRET;


function sendError(res, status, message, err = null) {
  if (err) console.error(message, err);
  return res.status(status).json({ message });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!['client', 'freelancer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already exists' });

    const newUser = new User({ name, email, password, role });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
       httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: 'Registered successfully', user: { id: newUser._id, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {

    const { email, password } = req.body;
    const user = await User.findOne({ email });
     console.log('User found:', user);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
        httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Login successful', user: { id: user._id, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email avatarUrl role");
    if (!user) return sendError(res, 404, "User not found");

    res.json(user);
  } catch (err) {
    return sendError(res, 500, "Server error", err);
  }
});

// ───────────────────────────────────────────
// Logout
// ───────────────────────────────────────────
const COOKIE_OPTIONS = {
  httpOnly: true,
    secure: true,        // SAME as login
    sameSite: "None",
};
router.post("/logout", (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  res.json({ message: "Logged out" });
});

module.exports = router;