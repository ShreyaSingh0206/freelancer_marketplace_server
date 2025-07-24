const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Seller = require("../models/SellerInfo");
const authenticate = require('../middlewares/auth'); 
const { upload } = require("../middlewares/upload");
const Gig = require('../models/Gig');
const Order = require('../models/Order');
// const Message = require('../models/Message')

router.post("/personal_info", authenticate, upload.single("profilePic"), async (req, res) => {
  console.log("User from token:", req.user);
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  try {
    const {
      fullName,
      education,
      contactEmail,
      contactPhone,
      description,
      occupations,
    } = req.body;

    const seller = new Seller({
      fullName,
      education,
      contact: {
    email: contactEmail,
    phone: contactPhone,
  },
      description,
      user: req.user._id, // Assuming req.user is populated with the authenticated user
      occupations: Array.isArray(occupations) ? occupations : [occupations],
      profilePic: req.file?.path || null,
    });

    await seller.save();
    res.status(201).json({ message: "Seller info saved", seller });
  } catch (err) {
    console.error("❌ Error saving seller info:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/seller/gigs
router.get('/gigs', authenticate, async (req, res) => {
  try {
    // Step 1: Get seller info from the authenticated user
    const seller = await Seller.findOne({ user: req.user._id });
    if (!seller) {
      return res.status(404).json({ error: "Seller profile not found" });
    }

    // Step 2: Find gigs using seller._id
    const gigs = await Gig.find({ seller: seller._id });
    res.json(gigs);
  } catch (err) {
    console.error("❌ Error fetching gigs:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/seller/orders/count
router.get('/orders/count', authenticate, async (req, res) => {
  console.log("🔍 Checking orders for user:", req.user._id);

  try {
    const orderCount = await Order.countDocuments({ sellerId: req.user._id });

    const orders = await Order.find({ sellerId: new mongoose.Types.ObjectId(req.user._id)});
    console.log("🔍 Orders found:", orders);

    res.json({ orderCount });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/seller/messages/count
// router.get('/messages/count', authenticate, async (req, res) => {
//   const sellerId = req.user.id;
//   const messageCount = await Message.countDocuments({ receiverId: sellerId });
//   res.json({ messageCount });
// });

module.exports = router;
