const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Gig = require("../models/Gig");
const Order = require("../models/Order");
const verifyToken = require("../middlewares/auth");
const mongoose = require("mongoose");


// ✅ 1. ADD REVIEW (ONLY AFTER ORDER COMPLETED)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { gigId, rating, comment, sellerId } = req.body;

     console.log("✅ Review Request:");
    console.log("User ID:", req.user._id);
    console.log("Gig ID:", gigId);

    // ✅ Check if buyer has completed order
    const order = await Order.findOne({
  gigId: new mongoose.Types.ObjectId(gigId), 
  buyerId: new mongoose.Types.ObjectId(req.user._id), 
  status: "completed",
});

    console.log("✅ Matching Order Found:", order);
    if (!order)
      return res.status(403).json("Only buyers can review after completion.");

    // ✅ Prevent multiple reviews
    const alreadyReviewed = await Review.findOne({
      gig: gigId,
      buyer: req.user._id,
    });

    if (alreadyReviewed)
      return res.status(400).json("You already reviewed this gig.");

    // ✅ Create Review
    const review = await Review.create({
      gig: gigId,
      buyer: req.user._id,
      seller: order.sellerId,
      rating,
      comment,
    });

    // ✅ Recalculate Gig Rating
    const reviews = await Review.find({ gig: gigId });

    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Gig.findByIdAndUpdate(gigId, {
      averageRating: avg.toFixed(1),
      totalReviews: reviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json(err);
  }
});


// ✅ 2. GET REVIEWS FOR A GIG
router.get("/:gigId", async (req, res) => {
  try {
    const reviews = await Review.find({ gig: req.params.gigId })
      .populate("buyer", "name profilePic")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
