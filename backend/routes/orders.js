const express = require("express");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const { evaluatePromo } = require("../utils/promo");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

// ---- helpers for placing an order --------------------------------------------------
const FREE_DELIVERY_OVER = 25; // matches the checkout screen
const SERVICE_FEE_RATE = 0.05;
const round2 = (n) => +Number(n).toFixed(2);
const normSlug = (s) => String(s).toLowerCase().replace(/\s+/g, " ").trim();

// The cart sends either a real MenuItem id (from /menu) or a slug like "the famous:smash-burger"
// (from the sample restaurant pages). Both resolve to a MenuItem document here.
async function findMenuItem(ref, name) {
  const value = String(ref ?? "").trim();
  const cleanName = String(name ?? "").trim();
  if (!value && !cleanName) return null;

  // Only query _id when the value is a valid 24-character MongoDB ObjectId.
  // Slugs such as "the famous:smash-burger" must never reach findById().
  if (/^[a-f\d]{24}$/i.test(value)) {
    const byId = await MenuItem.findById(value);
    if (byId) return byId;
  }

  // Sample-restaurant carts use a slug. Normalize whitespace/case so old
  // frontend data such as "THE  FAMOUS:smash-burger" still resolves.
  if (value) {
    const slug = normSlug(value);
    const bySlug = await MenuItem.findOne({ slug: { $regex: `^${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } });
    if (bySlug) return bySlug;
  }

  // Last-resort compatibility for carts created by older versions that only
  // stored the dish name. This is intentionally name-based and is only used
  // when the id/slug lookup failed.
  if (cleanName) {
    const byName = await MenuItem.findOne({ name: cleanName, isAvailable: true });
    if (byName) return byName;
  }

  return null;
}

class OrderError extends Error {}

// POST /api/orders - customer places a new order from their cart.
// Prices always come from the database, never from the browser.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, instructions, promoCode } = req.body;

    if (!Array.isArray(items) || !items.length) {
      throw new OrderError("Order must contain at least one item");
    }
    if (!deliveryAddress?.line1 || !deliveryAddress?.city) {
      throw new OrderError("A delivery address (street and city) is required");
    }

    const orderItems = [];
    let subtotal = 0;

    for (const raw of items) {
      const quantity = Number(raw.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
        throw new OrderError(`Invalid quantity for "${raw.name || raw.menuItem}"`);
      }

      const menuItem = await findMenuItem(raw.menuItem, raw.name);
      if (!menuItem) {
        throw new OrderError(
          `"${raw.name || raw.menuItem}" isn't on the menu. If it's a sample-restaurant dish, run: docker exec quickbite-api npm run seed`
        );
      }
      if (!menuItem.isAvailable) {
        throw new OrderError(`"${menuItem.name}" is currently unavailable`);
      }

      // Validate each chosen option against the real menu item and use the real price
      const selectedModifiers = [];
      for (const m of raw.selectedModifiers || []) {
        const group = menuItem.modifierGroups.find((g) => g.name === m.groupName);
        const option = group?.options.find((o) => o.name === m.optionName);
        if (!option) {
          throw new OrderError(`"${m.optionName}" isn't a valid option for "${menuItem.name}"`);
        }
        selectedModifiers.push({ groupName: group.name, optionName: option.name, priceDelta: option.priceDelta });
      }
      for (const group of menuItem.modifierGroups) {
        if (group.required && !selectedModifiers.some((m) => m.groupName === group.name)) {
          throw new OrderError(`Please choose a ${group.name} for "${menuItem.name}"`);
        }
      }

      const modifiersTotal = selectedModifiers.reduce((s, m) => s + m.priceDelta, 0);
      subtotal += (menuItem.price + modifiersTotal) * quantity;

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        unitPrice: menuItem.price,
        quantity,
        selectedModifiers,
        notes: String(raw.notes || "").slice(0, 300),
      });
    }

    subtotal = round2(subtotal);

    // Same rules the checkout screen shows: free delivery over $25 (or with a delivery promo),
    // 5% service fee, and the promo discount. Tax is not charged (the screen doesn't show one).
    const restaurant = await Restaurant.findOne();
    const promo = await evaluatePromo(promoCode, subtotal);
    const baseDeliveryFee = restaurant?.deliveryFee ?? 2.99;
    const deliveryFee = subtotal >= FREE_DELIVERY_OVER || promo.freeDelivery ? 0 : baseDeliveryFee;
    const serviceFee = round2(subtotal * SERVICE_FEE_RATE);
    const discount = promo.discount;
    const total = round2(subtotal + deliveryFee + serviceFee - discount);

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      subtotal,
      deliveryFee,
      serviceFee,
      discount,
      promoCode: promo.valid ? String(promoCode).trim().toUpperCase() : "",
      tax: 0,
      total,
      deliveryAddress: {
        line1: deliveryAddress.line1,
        line2: deliveryAddress.line2 || "",
        city: deliveryAddress.city,
        lat: deliveryAddress.lat,
        lng: deliveryAddress.lng,
      },
      instructions: String(instructions || "").slice(0, 300),
      paymentMethod: paymentMethod === "cash" ? "cash" : "card",
      status: "placed",
      statusHistory: [{ status: "placed" }],
    });

    // Notify the kitchen dashboard in real time that a new order has arrived
    req.app.get("io").to("kitchen").emit("order:new", order);

    res.status(201).json({ order });
  } catch (err) {
    console.error("[orders] place order failed:", err.message);
    const isClientError = err instanceof OrderError || err.name === "ValidationError";
    res
      .status(isClientError ? 400 : 500)
      .json({ error: "Could not place order", details: err.message });
  }
});

// GET /api/orders/mine - customer's own order history
router.get("/mine", requireAuth, async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

// GET /api/orders/:id - a single order (customer sees own, staff/admin sees any)
router.get("/:id", requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  const isOwner = order.customer.toString() === req.user._id.toString();
  const isStaff = ["staff", "admin"].includes(req.user.role);
  if (!isOwner && !isStaff) {
    return res.status(403).json({ error: "Not authorized to view this order" });
  }

  res.json({ order });
});

// GET /api/orders - staff/admin only, all active orders for the kitchen kanban board
router.get("/", requireAuth, requireRole("staff", "admin"), async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
  res.json({ orders });
});

// PATCH /api/orders/:id/status - staff/admin only, move an order to the next stage
router.patch("/:id/status", requireAuth, requireRole("staff", "admin"), async (req, res) => {
  const { status } = req.body;

  if (!Order.STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${Order.STATUSES.join(", ")}` });
  }

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  order.status = status;
  order.statusHistory.push({ status });
  await order.save();

  // Push the update to the specific customer tracking this order, and to the kitchen board
  req.app.get("io").to(`order:${order._id}`).emit("order:status", { orderId: order._id, status });
  req.app.get("io").to("kitchen").emit("order:updated", order);

  res.json({ order });
});

module.exports = router;
