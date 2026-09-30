// Everything that turns cart lines into something the backend will accept lives here,
// so Checkout, Review, and Re-order can never drift apart again.
// (Prices are never sent for trust: the backend re-prices every line from its database.)

const OBJECT_ID = /^[a-f0-9]{24}$/i;
const slugify = (s) =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Sample dishes use "<restaurant-id>:<dish-id>". Older carts may hold ids with spaces or
// capitals (e.g. "THE  FAMOUS:truffle-fries"); this converts them to the clean slug form.
// Real database ids (24-char hex) are returned untouched.
export function canonicalMenuId(id) {
  if (!id) return id;
  const s = String(id).trim();
  if (OBJECT_ID.test(s)) return s;
  const i = s.indexOf(":");
  if (i === -1) return s;
  return `${slugify(s.slice(0, i))}:${slugify(s.slice(i + 1))}`;
}

// The `items` array for POST /orders.
export function toOrderItems(cartItems) {
  return cartItems.map((line) => ({
    menuItem: canonicalMenuId(line.menuItem),
    name: line.name,
    unitPrice: line.unitPrice,
    quantity: line.quantity,
    selectedModifiers: line.selectedModifiers || [],
    notes: line.notes || "",
  }));
}

// Backend accepts "cash" or "card".
export const apiPaymentMethod = (method) => (method?.type === "cash" ? "cash" : "card");
