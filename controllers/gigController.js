const Gig = require('../models/Gig');
const Seller = require('../models/SellerInfo');

// Create
const createGig = async (req, res) => {
  try {
    const { title, desc, price, category } = req.body;

     const thumbnailUrl = req.file?.path;
     const sellerProfile = await Seller.findOne({ user: req.user._id });

if (!sellerProfile) {
  return res.status(404).json({ message: "Seller profile not found" });
}

    console.log("Creating gig for seller:", sellerProfile.fullName, sellerProfile.profilePic);

    const gig = await Gig.create({
      title,
      desc,
      price,
      category,
      thumbnail: thumbnailUrl,
      seller: sellerProfile._id,
    });
    res.status(201).json(gig);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Read all / filtered
const getGigs = async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const gigs = await Gig.find(filter).populate('seller', 'name');
  res.json(gigs);
};

// Read one
const getGig = async (req, res) => {
  const gig = await Gig.findById(req.params.id).populate('seller', 'name');
  if (!gig) return res.status(404).json({ message: 'Gig not found' });
  res.json(gig);
};

// Update (only seller can)
const updateGig = async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) return res.status(404).json({ message: 'Gig not found' });
  if (gig.seller.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not allowed' });

  Object.assign(gig, req.body);
  await gig.save();
  res.json(gig);
};

// Delete
const deleteGig = async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) return res.status(404).json({ message: 'Gig not found' });
  if (gig.seller.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not allowed' });

  await gig.remove();
  res.json({ message: 'Gig deleted' });
};

module.exports = {
  createGig,
  getGigs,
  getGig,
  updateGig,
  deleteGig,
};

