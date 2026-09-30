const express = require("express");
const Offer = require("../models/Offer");
const { requireAuth, requireRole } = require("../middleware/auth");
const router = express.Router();

const nowFilter = { $or: [{ startsAt: null }, { startsAt: { $lte: new Date() } }] };

router.get("/", async (req, res) => {
  const query = { active: true, ...nowFilter, $and: [{ $or: [{ endsAt: null }, { endsAt: { $gte: new Date() } }] }] };
  const offers = await Offer.find(query).sort({ createdAt: -1 });
  res.json({ offers });
});

router.get("/manage", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  const offers = await Offer.find().sort({ createdAt: -1 });
  res.json({ offers });
});

router.get("/validate/:code", async (req, res) => {
  const code = String(req.params.code || "").trim().toUpperCase();
  const subtotal = Number(req.query.subtotal || 0);
  const offer = await Offer.findOne({ code, active: true, ...nowFilter, $and: [{ $or: [{ endsAt: null }, { endsAt: { $gte: new Date() } }] }] });
  if (!offer) return res.json({ valid: false, discount: 0, freeDelivery: false, message: "That code isn't valid" });
  if (subtotal < offer.minSubtotal) return res.json({ valid: false, discount: 0, freeDelivery: false, message: `Add $${(offer.minSubtotal - subtotal).toFixed(2)} more to use ${code}` });
  let discount = 0;
  if (offer.type === "percent") discount = subtotal * offer.value / 100;
  if (offer.type === "fixed") discount = offer.value;
  if (offer.maxDiscount != null) discount = Math.min(discount, offer.maxDiscount);
  discount = Number(Math.min(discount, subtotal).toFixed(2));
  res.json({ valid: true, discount, freeDelivery: offer.type === "delivery", label: offer.title, message: "", offer });
});

router.post("/", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  try { const offer = await Offer.create({ ...req.body, code: String(req.body.code || "").trim().toUpperCase() }); res.status(201).json({ offer }); }
  catch (e) { res.status(400).json({ error: "Could not create offer", details: e.message }); }
});

router.put("/:id", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  try { const data = { ...req.body }; if (data.code) data.code = String(data.code).trim().toUpperCase(); const offer = await Offer.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }); if (!offer) return res.status(404).json({ error: "Offer not found" }); res.json({ offer }); }
  catch (e) { res.status(400).json({ error: "Could not update offer", details: e.message }); }
});

router.delete("/:id", requireAuth, requireRole("admin", "staff"), async (req, res) => { const offer = await Offer.findByIdAndDelete(req.params.id); if (!offer) return res.status(404).json({ error: "Offer not found" }); res.json({ success: true }); });
module.exports = router;
