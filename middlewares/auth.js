const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust path if needed

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(req, res, next) {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ✅ Fetch user from DB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user; // now req.user._id will be available
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
}

module.exports = verifyToken;

