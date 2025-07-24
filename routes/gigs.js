const express = require('express');

// Controller functions (CommonJS)
const {
  createGig,
  getGigs,
  getGig,
  updateGig,
  deleteGig,
} = require('../controllers/gigController');

// Middleware (CommonJS)
const verifyToken = require('../middlewares/auth');
const protectSeller = require('../middlewares/protectSeller');
const { upload } = require("../middlewares/upload");
const Gig = require('../models/Gig');
const Seller = require('../models/SellerInfo');

const router = express.Router();

// Routes for /api/gigs/
router
  .route('/')
  .post(verifyToken, upload.single("thumbnail"), createGig)   // Create a gig
  .get(getGigs);                  // List/filter gigs

router.get('/category/:slug', async (req, res) => {
  const { slug } = req.params;
  const category = slug.replace(/-/g, ' ').toLowerCase();

  try {
    const gigs = await Gig.find({
      category: { $regex: new RegExp(`^${category}$`, 'i') }
      }).populate({
        path: 'seller',
        select: 'fullName profilePic occupations education description contactEmail contactPhone',
      })
      .lean();
      console.log(gigs)

    res.status(200).json({ gigs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching gigs.' });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate({
      path: 'seller',
      select: 'fullName profilePic occupations education description contact',
    });

    if (!gig) return res.status(404).json({ message: 'Gig not found' });

    res.status(200).json(gig);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching gig details' });
  }
});


// Export router
module.exports = router;