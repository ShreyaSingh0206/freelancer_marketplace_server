const jwt = require("jsonwebtoken");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    // Join a conversation room
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User joined room: ${conversationId}`);
    });

    // Send message event
    // socket.on("sendMessage", async ({ conversationId, senderId, text }) => {
    //   try {
    //     const message = await Message.create({ conversationId, sender: senderId, text });
    //     io.to(conversationId).emit("newMessage", message); // broadcast to room
    //   } catch (err) {
    //     console.error("Error sending message:", err);
    //   }
    // });

     socket.on(
      "sendMessage",
      async ({ conversationId, sender, receiver, text }) => {
        try {
          if (!conversationId || !sender || !receiver || !text) {
            console.log("❌ Missing fields in sendMessage:", {
              conversationId,
              sender,
              receiver,
              text,
            });
            return;
          }

          const message = await Message.create({
            conversationId, 
            sender,         
            receiver,       
            text,           
          });

          // ✅ Broadcast message to everyone in this conversation
          io.to(conversationId).emit("newMessage", message);
        } catch (err) {
          console.error("❌ Error sending message:", err);
        }
      }
    );


    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
};
