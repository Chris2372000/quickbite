const express = require("express");
const MenuItem = require("../models/MenuItem");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/menu - public, anyone can browse the menu
router.get("/", async (req, res) => {
  // Dishes that belong to the sample restaurants are hidden here unless ?all=true
  const filter = req.query.all === "true" ? {} : { restaurant: { $in: ["", null] } };
  const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
  res.json({ items });
});

// GET /api/menu/:id - public, single item detail (for the customization screen)
router.get("/:id", async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ error: "Menu item not found" });
  res.json({ item });
});

// POST /api/menu - staff/admin only, add a new menu item
router.post("/", requireAuth, requireRole("staff", "admin"), async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ item });
  } catch (err) {
    res.status(400).json({ error: "Could not create menu item", details: err.message });
  }
});

// PUT /api/menu/:id - staff/admin only, edit an item (price, availability, etc.)
router.put("/:id", requireAuth, requireRole("staff", "admin"), async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) return res.status(404).json({ error: "Menu item not found" });
  res.json({ item });
});

// DELETE /api/menu/:id - staff/admin only
router.delete("/:id", requireAuth, requireRole("staff", "admin"), async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ error: "Menu item not found" });
  res.json({ success: true });
});

module.exports = router;
