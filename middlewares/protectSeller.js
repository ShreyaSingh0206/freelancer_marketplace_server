const User = require("../models/User");
const Seller = require("../models/SellerInfo");
const Gig = require("../models/Gig");

const protectSeller = async (req, res, next) => {
  try {
    // 1. Role check
    if (req.user?.role !== "freelancer") {
      return res.status(403).json({
        message: "Only freelancers can perform this action"
      });
    }

    const user = await User.findById(req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Subscription check
    if (!user.isSubscribed) {
      return res.status(403).json({
        message: "Subscription required. Please purchase a plan to start selling."
      });
    }

    // 3. Expiry check
    if (user.subscriptionExpiry && user.subscriptionExpiry < new Date()) {
      user.isSubscribed = false;
      user.subscriptionPlan = null;
      await user.save();

      return res.status(403).json({
        message: "Subscription expired"
      });
    }

    // 4. Seller profile check
    const sellerProfile = await Seller.findOne({ user: user._id });

    if (!sellerProfile) {
      return res.status(403).json({
        message: "Complete seller profile first"
      });
    }

    // ✅ 5. APPLY LIMIT ONLY FOR CREATE (POST)
    if (req.method === "POST") {
      const gigCount = await Gig.countDocuments({ seller: sellerProfile._id });

      const limits = {
        basic: 2,
        pro: 10,
        premium: Infinity
      };

      if (gigCount >= limits[user.subscriptionPlan]) {
        return res.status(403).json({
          message: `Your ${user.subscriptionPlan} plan limit reached`
        });
      }
    }

    next();

  } catch (err) {
    console.error("protectSeller error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = protectSeller;