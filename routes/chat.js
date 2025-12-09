const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/auth");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// 1️⃣ Get all conversations for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name role")
      .populate("gigId", "title");
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});

// ✅ Get single conversation by ID
router.get("/:conversationId", verifyToken, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate("participants", "name role");

    res.status(200).json(conversation);
  } catch (err) {
    console.error("Fetch single conversation error:", err);
    res.status(500).json({ message: "Failed to load conversation" });
  }
});

// 2️⃣ Get all messages in a conversation
router.get("/:conversationId/messages", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate("sender", "name role");
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// 3️⃣ Send a message
router.post("/:conversationId/messages", verifyToken, async (req, res) => {
  const { text } = req.body;
  try {
    const message = await Message.create({
      conversationId: req.params.conversationId,
      sender: req.user._id,
      text,
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// 4️⃣ Create a new conversation
router.post("/create", verifyToken, async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    // ✅ Check if already exists
    const existingConversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (existingConversation) {
      return res.status(200).json(existingConversation);
    }

    // ✅ Create new conversation
    const newConversation = await Conversation.create({
      participants: [senderId, receiverId],
    });

    res.status(201).json(newConversation);
  } catch (err) {
    console.error("CREATE CHAT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
