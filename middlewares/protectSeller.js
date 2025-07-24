function protectSeller(req, res, next) {
  if (req.user?.role !== 'seller') {
    return res.status(403).json({ message: 'Only sellers can perform this action' });
  }
  next();
}

module.exports = protectSeller;
