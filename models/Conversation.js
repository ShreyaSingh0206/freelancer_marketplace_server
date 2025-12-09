const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: "Gig", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
