const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

// 🧩 Import routes
const authRoutes = require('./routes/auth.js');
const gigRoutes = require('./routes/gigs.js');
const sellerRoutes = require("./routes/seller");
const paymentWebhook = require('./routes/webhook');
const paymentRoutes = require('./routes/payment');
const searchRoutes = require("./routes/gigRoutes"); 
const orderRoutes = require("./routes/orders");
const wishlistRoutes = require("./routes/wishlist");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat"); // ✅ new chat routes

// ⚙️ Initialize app & server
const app = express();
const server = http.createServer(app);

// ⚡ Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: [process.env.PUBLIC_URL],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// 🔌 Attach socket handler
require('./socket/socket')(io); 

// ⚠️ Webhook must be BEFORE express.json() because it needs raw body
app.use('/api/payment', paymentWebhook);

// 🔗 Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🧰 Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: [process.env.PUBLIC_URL],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}));

app.use(express.json());
app.use(bodyParser.json());

// 🛣️ Routes
app.use('/api/auth', authRoutes); 
app.use('/api/gigs', gigRoutes);
app.use("/api/seller", sellerRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes); // ✅ chat API routes
app.use("/api", searchRoutes);

// 🚀 Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
