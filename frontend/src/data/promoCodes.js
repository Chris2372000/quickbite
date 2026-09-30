// One list of promo codes, shared by the Offers page and checkout.
export const PROMO_CODES = {
  QUICKBITE20: { type: "percent", value: 20, label: "20% off" },
  TRUFFLE20: { type: "percent", value: 20, min: 35, max: 15, label: "20% off (up to $15)" },
  BOGOPIZZA: { type: "fixed", value: 14, min: 40, label: "free Margherita ($14 off)" },
  UMAMIFREE: { type: "delivery", min: 28, label: "free delivery" },
  DIMSUM15: { type: "percent", value: 15, min: 30, label: "15% off" },
  GREEN25: { type: "percent", value: 25, min: 25, label: "25% off" },
  GELATOFREE: { type: "fixed", value: 5, label: "free scoop ($5 off)" },
  FREEFRIES: { type: "fixed", value: 7, min: 20, label: "free fries ($7 off)" },
  LUNCHRUSH10: { type: "fixed", value: 3, label: "$3 off" },
  WEEKEND25: { type: "percent", value: 25, label: "25% off" },
  FREEDELIVERY: { type: "delivery", label: "free delivery" },
  WELCOME: { type: "percent", value: 15, label: "15% off your first order" },
};

export function evaluatePromo(code, subtotal) {
  if (!code) return { valid: false, discount: 0, freeDelivery: false, message: "" };
  const promo = PROMO_CODES[code];
  if (!promo) return { valid: false, discount: 0, freeDelivery: false, message: "That code isn't valid" };
  if (promo.min && subtotal < promo.min)
    return { valid: false, discount: 0, freeDelivery: false, message: `Add $${(promo.min - subtotal).toFixed(2)} more to use ${code}` };
  let discount = 0;
  if (promo.type === "percent") discount = subtotal * (promo.value / 100);
  if (promo.type === "fixed") discount = promo.value;
  if (promo.max) discount = Math.min(discount, promo.max);
  discount = +Math.min(discount, subtotal).toFixed(2);
  return { valid: true, discount, freeDelivery: promo.type === "delivery", label: promo.label, message: "" };
}
