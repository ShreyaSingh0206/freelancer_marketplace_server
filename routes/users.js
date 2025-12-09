const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth');
const User = require('../models/User');

router.post("/become-seller", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "freelancer"; // Or "seller" depending on your role design
    await user.save();

    res.status(200).json({ message: "Role updated to freelancer" });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ message: "Failed to update role" });
  }
});

module.exports = router;
