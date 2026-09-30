const mongoose = require("mongoose");

// Since this is a single-restaurant app, we only ever expect ONE document
// in this collection - it holds the restaurant's own profile/settings.
const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, default: "QuickBite" },
    description: { type: String, default: "" },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    deliveryFee: { type: Number, default: 2.99 },
    taxRate: { type: Number, default: 0.08 }, // 8%
    isOpen: { type: Boolean, default: true },
    openingHours: {
      // 24h "HH:mm" strings, one entry per day; null means closed that day
      mon: { open: String, close: String },
      tue: { open: String, close: String },
      wed: { open: String, close: String },
      thu: { open: String, close: String },
      fri: { open: String, close: String },
      sat: { open: String, close: String },
      sun: { open: String, close: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
