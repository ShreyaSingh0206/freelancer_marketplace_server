const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth");
const Wishlist = require("../models/Wishlist");

router.get("/my-wishlist", verifyToken, async (req, res) => {
  try {
     console.log("Fetching wishlist for user:", req.user._id);
    const wishlist = await Wishlist.findOne({ userId: req.user._id }).populate("gigs");
     if (!wishlist) {
      console.log("No wishlist found");
      return res.status(200).json([]);
    }

    console.log("Populated gigs:", wishlist.gigs);
    res.status(200).json(wishlist.gigs);
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

router.post("/add", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id; // from middleware
    const { gigId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // If wishlist doesn't exist, create new one
      wishlist = await Wishlist.create({ userId, gigs: [gigId] });
      return res.status(201).json({ message: "Wishlist created and gig added" });
    }

    // Check if gig already exists in wishlist
    if (wishlist.gigs.includes(gigId)) {
      return res.status(400).json({ message: "Gig already in wishlist" });
    }

    // Add gig to existing wishlist
    wishlist.gigs.push(gigId);
    await wishlist.save();

    res.status(200).json({ message: "Gig added to wishlist" });
  } catch (err) {
    console.error("Error adding to wishlist:", err);
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

// DELETE /api/wishlist/remove/:gigId
router.delete("/remove/:gigId", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { gigId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.gigs = wishlist.gigs.filter(g => g.toString() !== gigId);
    await wishlist.save();

    res.status(200).json({ message: "Gig removed from wishlist" });
  } catch (err) {
    console.error("Error removing from wishlist:", err);
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
});

module.exports = router;
