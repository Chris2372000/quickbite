const express = require("express");
const Restaurant = require("../models/Restaurant");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/restaurant - public, powers the landing page / header info
router.get("/", async (req, res) => {
  let restaurant = await Restaurant.findOne();
  if (!restaurant) {
    // Auto-create a default settings doc on first run
    restaurant = await Restaurant.create({});
  }
  res.json({ restaurant });
});

// PUT /api/restaurant - admin only, edit name/hours/fees/etc.
router.put("/", requireAuth, requireRole("admin"), async (req, res) => {
  let restaurant = await Restaurant.findOne();
  if (!restaurant) {
    restaurant = await Restaurant.create(req.body);
  } else {
    Object.assign(restaurant, req.body);
    await restaurant.save();
  }
  res.json({ restaurant });
});

module.exports = router;
