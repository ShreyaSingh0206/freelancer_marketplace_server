const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth.js');
const gigRoutes = require('./routes/gigs.js');
const sellerRoutes = require("./routes/seller");
const paymentWebhook = require('./routes/webhook');
const paymentRoutes = require('./routes/payment');


const app = express()


app.use('/api/payment', paymentWebhook); // 

const port = process.env.PORT

mongoose.connect(process.env.MONGO_URI,{
  
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
})

app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(cors({origin: [process.env.PUBLIC_URL],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
}));

app.use(express.json());
app.use(bodyParser.json())

app.use('/api/auth', authRoutes); 
app.use('/api/gigs', gigRoutes);
app.use("/api/seller", sellerRoutes);
app.use('/api/payment', paymentRoutes);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
