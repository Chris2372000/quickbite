const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  type: { type: String, enum: ["percent", "fixed", "delivery"], required: true },
  value: { type: Number, default: 0, min: 0 },
  minSubtotal: { type: Number, default: 0, min: 0 },
  maxDiscount: { type: Number, default: null, min: 0 },
  active: { type: Boolean, default: true },
  startsAt: { type: Date, default: Date.now },
  endsAt: { type: Date, default: null },
  imageUrl: { type: String, default: "" },
  badge: { type: String, default: "Deal" },
  category: { type: String, default: "all" },
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);
