import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { toOrderItems } from "../utils/orderItems";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({ line1: "", line2: "", city: "" });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-on-surface-variant mb-4">Please log in to check out.</p>
        <button onClick={() => navigate("/login")} className="text-primary font-semibold">
          Go to Login →
        </button>
      </div>
    );
  }

  async function handlePlaceOrder(e) {
    e.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const items = toOrderItems(cartItems);

      const res = await client.post("/orders", {
        items,
        deliveryAddress: address,
        paymentMethod,
      });

      clearCart();
      navigate(`/orders/${res.data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-on-surface mb-6">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="space-y-5">
        <div>
          <h2 className="font-semibold text-on-surface mb-2">Delivery Address</h2>
          <input
            placeholder="Street address"
            className="w-full mb-2 px-3 py-2 rounded-lg border border-outline-variant"
            value={address.line1}
            onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            required
          />
          <input
            placeholder="Apt / suite (optional)"
            className="w-full mb-2 px-3 py-2 rounded-lg border border-outline-variant"
            value={address.line2}
            onChange={(e) => setAddress({ ...address, line2: e.target.value })}
          />
          <input
            placeholder="City"
            className="w-full px-3 py-2 rounded-lg border border-outline-variant"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            required
          />
        </div>

        <div>
          <h2 className="font-semibold text-on-surface mb-2">Payment Method</h2>
          <label className="flex items-center gap-2 mb-1">
            <input
              type="radio"
              checked={paymentMethod === "card"}
              onChange={() => setPaymentMethod("card")}
            />
            Card (test mode — no real charge in this scaffold)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
            />
            Cash on delivery
          </label>
        </div>

        <div className="border-t border-surface-container-highest pt-4 flex justify-between font-semibold text-on-surface">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-on-surface-variant">
          Delivery fee and tax are added by the server based on the restaurant's current rates.
        </p>

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          disabled={placing || !cartItems.length}
          className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold disabled:opacity-60"
        >
          {placing ? "Placing order…" : "Place Order"}
        </button>
      </form>
    </div>
  );
}
