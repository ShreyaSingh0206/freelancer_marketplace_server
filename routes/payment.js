const express = require('express');
const router = express.Router();
const stripe = require('../utils/stripe'); // Your Stripe instance
const verifyToken = require('../middlewares/auth');
const Gig = require('../models/Gig');
const Order = require('../models/Order');
const Seller = require('../models/SellerInfo');
const Conversation = require("../models/Conversation");


router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try{
  const { gigId } = req.body;
  const gig = await Gig.findById(gigId);
  if (!gig) return res.status(404).json({ error: "Gig not found" });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: gig.title,
        },
        unit_amount: gig.price * 100,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.PUBLIC_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&gigId=${gigId}`,
    cancel_url: `${process.env.PUBLIC_URL}/gig/${gigId}`,
     metadata: {
        userId: req.user.id, // add buyer ID to metadata for later use
        gigId: gigId
      },
  });

  res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.post('/verify-session', verifyToken, async (req, res) => {
  const { sessionId, gigId } = req.body;

  try {
     
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    
    console.log("Stripe session payment status:", session.payment_status);

    if (session.payment_status === "paid") {
      const gig = await Gig.findById(gigId);
      if (!gig) return res.status(404).json({ error: "Gig not found" });

        const buyerId = session.metadata.userId;

      const sellerProfile = await Seller.findById(gig.seller);
      console.log("sellerProfile:", sellerProfile);
if (!sellerProfile) return res.status(404).json({ error: "Seller profile not found" });

      const sellerId = sellerProfile.user;  
      
      console.log("Creating order for buyer:", buyerId, "seller:", sellerId);

      const existing = await Order.findOne({ gigId, buyerId });
      if (existing) return res.json({ message: "Order already exists" });

      const order = await Order.create({
        buyerId,
        sellerId,
        gigId,
        status: "completed",
      });

      console.log("Order created:", order);

       // 2. Create or fetch conversation 
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

      return res.json(order);
    } else {
      return res.status(400).json({ error: "Payment not completed" });
    }
  } catch (err) {
    console.error("Session verification error:", err);
    res.status(500).json({ error: "Failed to verify session" });
  }
});

module.exports = router;