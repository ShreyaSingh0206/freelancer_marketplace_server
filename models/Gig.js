const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true },
    desc:     { type: String, required: true },
    price:    { type: Number, required: true, min: 5 },
    category: { type: String, required: true, enum: ['Logo Design', 'Website Development', 'Android App Development', 'iOS App Development', 'UI/UX Design', 'Writing', 'Marketing', 'Video and animation'] },
    thumbnail:   [{ type: String }],
    seller:   { type: mongoose.Schema.Types.ObjectId, ref: 'SellerInfo', required: true },
 
    averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gig', gigSchema);
