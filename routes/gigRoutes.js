const express = require("express");
const router = express.Router();
const Gig = require("../models/Gig"); // adjust path as needed

// @route   GET /api/search
// @desc    Search gigs by category or keyword
// @access  Public
router.get("/search", async (req, res) => {
  try {
    const { category, q } = req.query;

    const filters = {};

    // Filter by category (exact or partial match)
    if (category) {
      filters.category = new RegExp(category, "i"); // case-insensitive
    }

    // If keyword query is provided
    if (q) {
      filters.$or = [
        { title: new RegExp(q, "i") },
        { description: new RegExp(q, "i") },
        { category: new RegExp(q, "i") },
      ];
    }

    const gigs = await Gig.find(filters);
    res.json(gigs);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server error while searching gigs." });
  }
});

module.exports = router;
