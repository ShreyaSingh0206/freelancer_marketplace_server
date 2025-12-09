// controllers/orderController.js
const Order = require("../models/Order");
const Conversation = require("../models/Conversation");
const Gig = require("../models/Gig");

const createOrder = async (req, res) => {
  const { buyerId, gigId } = req.body;

  try {
    const gig = await Gig.findById(gigId).populate("seller");
    if (!gig) return res.status(404).json({ error: "Gig not found" });

    const sellerId = gig.seller._id;

    // 1. Create the order
    const order = await Order.create({
      buyerId,
      sellerId,
      gigId,
      status: "pending",
    });

    // 2. Create a conversation if it doesn't exist
    let conversation = await Conversation.findOne({
  participants: { $all: [buyerId, sellerId] },
  gigId,
});

if (!conversation) {
  conversation = await Conversation.create({
    participants: [buyerId, sellerId],
    gigId,
  });
}  
console.log("✅ Conversation created:", conversation);

    res.status(201).json({ order, conversation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
};
