const express = require('express');
const router = express.Router();
const stripe = require('../utils/stripe');
const Gig = require('../models/Gig');
const Order = require('../models/Order');

// Make sure to mount this route BEFORE express.json() in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const gigId = session.metadata.gigId;
    const buyerId = session.metadata.userId;

    try {
      const gig = await Gig.findById(gigId);
      if (!gig) throw new Error("Gig not found");

      const sellerId = gig.sellerId;

      await Order.create({
        buyerId,
        sellerId,
        gigId,
        status: 'pending',
      });

      console.log("Order created after payment");
    } catch (err) {
      console.error("Order creation error:", err);
      return res.status(500).send("Failed to create order");
    }
  }

  res.json({ received: true });
});

module.exports = router;
