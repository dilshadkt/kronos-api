const mongoose = require("mongoose");

const affiliateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    profileImage: { type: String, required: true }, // URL of the profile image
    googleFormLink: { type: String, required: true }, // URL of the Google Form
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Affiliate", affiliateSchema);
