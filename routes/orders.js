const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth");
const Order = require("../models/Order");
const Gig = require("../models/Gig");

// router.get("/my-orders", verifyToken, async (req, res) => {
//   try {
//     const orders = await Order.find({ buyerId: req.user.id }).populate("gigId");
//     const formatted = orders.map((order) => ({
//       _id: order._id,
//       gig: order.gigId,
//     }));
//     res.status(200).json(formatted);
//   } catch (err) {
//     console.error("Error fetching orders:", err);
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

router.get("/my-orders", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id })
      .populate({
        path: "gigId",
        populate: {
          path: "seller",
          model: "SellerInfo",
          populate: {
            path: "user",
            model: "User",
          },
        },
      });

    const formatted = orders.map((order) => ({
      _id: order._id,
      gig: order.gigId,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


module.exports = router;
