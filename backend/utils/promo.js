const Offer = require("../models/Offer");

async function evaluatePromo(code, subtotal) {
  const none = { valid: false, discount: 0, freeDelivery: false, label: "", message: "That code isn't valid" };
  if (!code) return none;
  const value = String(code).trim().toUpperCase();
  const offer = await Offer.findOne({ code: value, active: true, startsAt: { $lte: new Date() }, $or: [{ endsAt: null }, { endsAt: { $gte: new Date() } }] });
  if (!offer) return none;
  if (subtotal < offer.minSubtotal) return { ...none, message: `Add $${(offer.minSubtotal - subtotal).toFixed(2)} more to use ${value}` };
  let discount = 0;
  if (offer.type === "percent") discount = subtotal * offer.value / 100;
  if (offer.type === "fixed") discount = offer.value;
  if (offer.maxDiscount != null) discount = Math.min(discount, offer.maxDiscount);
  discount = +Math.min(discount, subtotal).toFixed(2);
  return { valid: true, discount, freeDelivery: offer.type === "delivery", label: offer.title, message: "" };
}
module.exports = { evaluatePromo };
