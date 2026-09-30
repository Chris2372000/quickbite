const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true }, // snapshot at time of order
    unitPrice: { type: Number, required: true }, // snapshot at time of order
    quantity: { type: Number, required: true, min: 1 },
    selectedModifiers: [
      {
        groupName: String,
        optionName: String,
        priceDelta: Number,
      },
    ],
    notes: { type: String, default: "" },
  },
  { _id: false }
);

// The lifecycle an order moves through - this powers both the customer's
// live tracking screen and the restaurant's kitchen kanban board.
const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    promoCode: { type: String, default: "" },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      lat: Number,
      lng: Number,
    },
    instructions: { type: String, default: "" },
    paymentMethod: { type: String, enum: ["card", "cash"], default: "card" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    status: { type: String, enum: ORDER_STATUSES, default: "placed" },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.statics.STATUSES = ORDER_STATUSES;

module.exports = mongoose.model("Order", orderSchema);
