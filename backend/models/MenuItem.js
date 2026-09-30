const mongoose = require("mongoose");

// A modifier option a customer can pick, e.g. "Extra cheese +$1.50"
const modifierOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priceDelta: { type: Number, default: 0 },
  },
  { _id: false }
);

// A modifier group, e.g. "Size" (choose 1) or "Toppings" (choose many)
const modifierGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    required: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false }, // allow selecting more than one option
    options: [modifierOptionSchema],
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true }, // e.g. "Burgers", "Drinks"
    imageUrl: { type: String, default: "" },
    modifierGroups: [modifierGroupSchema],
    isAvailable: { type: Boolean, default: true },
    // Set on the dishes of the front-end's sample restaurants. The cart sends this
    // ("<restaurant id>:<dish id>", lowercased) instead of a database id.
    slug: { type: String, unique: true, sparse: true, trim: true },
    // Name of the sample restaurant this dish belongs to (empty for the main menu)
    restaurant: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
