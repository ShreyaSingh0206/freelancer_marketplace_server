const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');


const authRoutes = require('./routes/auth.js');
const gigRoutes = require('./routes/gigs.js');
const sellerRoutes = require("./routes/seller");
const paymentWebhook = require('./routes/webhook');
const paymentRoutes = require('./routes/payment');
const searchRoutes = require("./routes/gigRoutes"); 
const orderRoutes = require("./routes/orders");
const wishlistRoutes = require("./routes/wishlist");
const userRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat"); 
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: [process.env.PUBLIC_URL],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});


require('./socket/socket')(io); 


app.use('/api/payment', paymentWebhook);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

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


app.use('/api/auth', authRoutes); 
app.use('/api/gigs', gigRoutes);
app.use("/api/seller", sellerRoutes);
app.use('/api/payment', paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes); 
app.use("/api", searchRoutes);
app.use("/api/reviews", reviewRoutes);

// 🚀 Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
