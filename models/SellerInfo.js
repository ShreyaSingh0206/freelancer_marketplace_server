const mongoose = require("mongoose");

const { Schema } = mongoose;

const OCCUPATIONS = [
  "web developer",
  "app developer",
  "graphic designer",
  "ui/ux designer",
  "marketing",
  "writing",
  "video and animation",
];

const contactSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
  },
  { _id: false }
);

const sellerInfoSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, },
    fullName: { type: String, required: true, trim: true },
    profilePic: { type: String }, // URL to Cloudinary
    education: { type: String },
    contact: contactSchema,
    description: { type: String, maxlength: 1000 },
    occupations: {
      type: [String],
      enum: OCCUPATIONS,
      validate: {
        validator: (val) => val.length > 0,
        message: "At least one occupation must be selected",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.SellerInfo || mongoose.model("SellerInfo", sellerInfoSchema);
