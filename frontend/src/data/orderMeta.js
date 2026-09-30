import { useEffect, useState } from "react";
import client from "../api/client";

// ---------- Status model (matches backend Order.STATUSES) ----------
export const STATUS_ORDER = [
  "placed",
  "confirmed",
  "preparing",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
];

export const ACTIVE_STATUSES = STATUS_ORDER.slice(0, 5);

export const STATUS_LABELS = {
  placed: "Order Placed",
  confirmed: "Restaurant Confirmed",
  preparing: "Preparing Your Food",
  ready_for_pickup: "Packed & Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const STATUS_SUBTEXT = {
  placed: "We've received your order",
  confirmed: "The kitchen accepted your order",
  preparing: "Your items are being made fresh",
  ready_for_pickup: "Packed and sealed for the courier",
  out_for_delivery: "Your courier is on the way",
  delivered: "Enjoy your meal!",
};

// Coarser 4-stage view used on the confirmation page and the history progress bar.
export const KITCHEN_STAGES = [
  { label: "Order Confirmed", sub: "Sent to the kitchen" },
  { label: "Preparing Food", sub: "Estimated 10–15 mins" },
  { label: "Courier on Way", sub: "Assigned after prep" },
  { label: "Delivered", sub: "At your door" },
];

export function stageIndex(status) {
  switch (status) {
    case "placed":
    case "confirmed":
      return 0;
    case "preparing":
    case "ready_for_pickup":
      return 1;
    case "out_for_delivery":
      return 2;
    case "delivered":
      return 3;
    default:
      return -1;
  }
}

// ---------- Formatting ----------
export function orderCode(id = "") {
  const s = id.slice(-6).toUpperCase().padStart(6, "0");
  return `QB-${s.slice(0, 4)}-${s.slice(4)}`;
}

export const money = (n = 0) => `$${Number(n).toFixed(2)}`;

export function fmtTime(d) {
  return new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function fmtDateTime(d) {
  const dt = new Date(d);
  return `${dt.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })} at ${fmtTime(dt)}`;
}

export function lineTotal(item) {
  const mods = (item.selectedModifiers || []).reduce((s, m) => s + (m.priceDelta || 0), 0);
  return (item.unitPrice + mods) * item.quantity;
}

export const itemCount = (order) => order.items.reduce((n, i) => n + i.quantity, 0);

export const itemsSummary = (order) =>
  order.items.map((i) => (i.quantity > 1 ? `${i.name} (x${i.quantity})` : i.name)).join(", ");

export function paymentLabel(order) {
  if (order.paymentMethod === "cash") return "Cash on delivery";
  return order.paymentStatus === "paid" ? "Card · Paid" : "Card";
}

// Delivery estimate: 30 min after the order was placed.
export function etaDate(order) {
  return new Date(new Date(order.createdAt).getTime() + 30 * 60000);
}

export function timeOfStatus(order, status) {
  const hit = (order.statusHistory || []).find((h) => h.status === status);
  return hit ? hit.at : null;
}

// Re-render every `ms` so countdowns / "minutes left" stay live.
export function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

// ---------- Images ----------
// Thumbnails were cropped from the design reference and live in /public/images/orders.
// Add more files there and extend this list to cover more of your menu.
const IMAGE_RULES = [
  [/burger/i, "burger", "🍔"],
  [/fries|chips/i, "fries", "🍟"],
  [/shake|smoothie|milk/i, "milkshake", "🥤"],
  [/pizza|margherita/i, "pizza", "🍕"],
  [/ramen|noodle|soup/i, "ramen", "🍜"],
  [/dumpling|dim sum|bao/i, "dimsum", "🥟"],
  [/taco|burrito/i, "tacos", "🌮"],
  [/salad/i, null, "🥗"],
  [/chicken|sandwich/i, null, "🍗"],
  [/drink|lemonade|juice|soda|coffee/i, null, "🥤"],
];

export function dishVisual(name = "") {
  for (const [re, file, emoji] of IMAGE_RULES) {
    if (re.test(name)) return { src: file ? `/images/orders/${file}.jpg` : null, emoji };
  }
  return { src: null, emoji: "🍽️" };
}

// ---------- Restaurant info (single-restaurant app) ----------
export function useRestaurant() {
  const [restaurant, setRestaurant] = useState({
    name: "QuickBite Kitchen",
    address: "",
    phone: "",
  });
  useEffect(() => {
    client
      .get("/restaurant")
      .then((res) => setRestaurant((r) => ({ ...r, ...res.data.restaurant })))
      .catch(() => {});
  }, []);
  return restaurant;
}
