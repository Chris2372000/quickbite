import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import CheckoutSteps from "../../components/CheckoutSteps";
import client from "../../api/client";
import { toOrderItems, apiPaymentMethod } from "../../utils/orderItems";
import { useCart } from "../../context/CartContext";
import { useAddresses } from "../../context/AddressesContext";
import { usePaymentMethods } from "../../context/PaymentMethodsContext";
import { useCheckout } from "../../context/CheckoutContext";

const BRAND_ICON = { Visa: "💳", Mastercard: "💳", "Cash on delivery": "💵", "Mobile Money": "📱" };

export default function CheckoutReview() {
  const { cartItems, subtotal, clearCart } = useCart();
  const { addresses } = useAddresses();
  const { methods } = usePaymentMethods();
  const { addressId, paymentMethodId, instructions, promoCode, setPromoCode } = useCheckout();
  const navigate = useNavigate();

  const [status, setStatus] = useState("idle"); // idle | processing | failed
  const [promoInput, setPromoInput] = useState(promoCode);
  const [error, setError] = useState("");
  const [promo, setPromo] = useState({ valid:false, discount:0, freeDelivery:false, message:"" });

  useEffect(() => { let live=true; if (!promoCode) { setPromo({valid:false,discount:0,freeDelivery:false,message:""}); return; } client.get(`/offers/validate/${encodeURIComponent(promoCode)}?subtotal=${subtotal}`).then(r=>{if(live)setPromo(r.data);}).catch(()=>live&&setPromo({valid:false,discount:0,freeDelivery:false,message:"Could not validate offer"})); return ()=>{live=false}; }, [promoCode, subtotal]);

  if (!addressId || !paymentMethodId) return <Navigate to="/checkout/address" replace />;
  if (!cartItems.length) return <Navigate to="/cart" replace />;

  const address = addresses.find((a) => a.id === addressId);
  const payment = methods.find((m) => m.id === paymentMethodId);
  if (!address) return <Navigate to="/checkout/address" replace />;
  if (!payment) return <Navigate to="/checkout/payment" replace />;
  const deliveryFee = subtotal >= 25 || promo.freeDelivery ? 0 : 2.99;
  const serviceFee = +(subtotal * 0.05).toFixed(2);
  const discount = promo.discount;
  const total = +(subtotal + deliveryFee + serviceFee - discount).toFixed(2);

  function applyPromo() {
    setPromoCode(promoInput.trim().toUpperCase());
  }

  async function handlePlaceOrder() {
    setError("");
    setStatus("processing");
    try {
      const items = toOrderItems(cartItems);

      const res = await client.post("/orders", {
        items,
        deliveryAddress: { line1: address.line1, line2: address.line2 || "", city: address.city },
        paymentMethod: apiPaymentMethod(payment),
        instructions,
        ...(promoCode && promo.valid ? { promoCode } : {}),
      });

      clearCart();
      navigate(`/order-confirmation/${res.data.order._id}`);
    } catch (err) {
      const data = err.response?.data;
      const serverMsg = data?.error || data?.message;
      console.error("Place order failed:", err.response?.status, data || err.message);
      if (!err.response) setError("Can't reach the server. Check that the backend is running and VITE_API_URL is correct.");
      else if (err.response.status === 401) setError("Your session expired. Please log in again.");
      else setError(`${serverMsg || "The server rejected this order."}${data?.details ? ` — ${data.details}` : ""} (HTTP ${err.response.status})`);
      setStatus("failed");
    }
  }

  return (
    <div className="qb-checkout-page">
      <CheckoutSteps current="review" />
      <h1>Review your order</h1>

      <div className="qb-review-block">
        <div className="qb-review-block-head">
          <b>Delivery address</b>
          <Link to="/checkout/address">Change</Link>
        </div>
        {address && (
          <p>
            {address.label} — {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}, {address.city}
          </p>
        )}
        {instructions && <p className="muted-line">Note: {instructions}</p>}
      </div>

      <div className="qb-review-block">
        <div className="qb-review-block-head">
          <b>Payment method</b>
          <Link to="/checkout/payment">Change</Link>
        </div>
        {payment && (
          <p>
            {BRAND_ICON[payment.brand] || "💳"} {payment.brand} {payment.last4 && `•••• ${payment.last4}`}
          </p>
        )}
      </div>

      <div className="qb-review-block">
        <div className="qb-review-block-head">
          <b>Items ({cartItems.length})</b>
          <Link to="/cart">Edit cart</Link>
        </div>
        {cartItems.map((item) => (
          <div key={item.cartId} className="qb-review-item">
            <span>
              {item.quantity} × {item.name}
            </span>
            <span>
              $
              {(
                (item.unitPrice + (item.selectedModifiers || []).reduce((s, m) => s + (m.priceDelta || 0), 0)) *
                item.quantity
              ).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="qb-review-block">
        <div className="qb-promo-row">
          <input
            placeholder="Promo code"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
          />
          <button type="button" onClick={applyPromo}>
            Apply
          </button>
        </div>
        {promoCode && promo.valid && <p className="qb-promo-applied">✓ {promoCode} applied — {promo.label}</p>}
        {promoCode && !promo.valid && <p className="qb-promo-invalid">{promo.message}</p>}

        <div className="qb-totals">
          <div>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div>
            <span>Delivery fee</span>
            <span>{deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}</span>
          </div>
          <div>
            <span>Service fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="qb-totals-discount">
              <span>Discount</span>
              <span>−${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="qb-totals-final">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <p className="muted-line">Estimated delivery: 25–35 min</p>
      </div>

      {status === "failed" && (
        <div className="qb-payment-error">
          <p>⚠ {error}</p>
          <div className="qb-checkout-nav">
            <Link to="/checkout/payment" className="qb-secondary-btn">
              Change payment method
            </Link>
            <button className="primary-btn" onClick={handlePlaceOrder}>
              Retry
            </button>
          </div>
        </div>
      )}

      {status !== "failed" && (
        <div className="qb-checkout-nav">
          <button className="qb-secondary-btn" onClick={() => navigate("/checkout/payment")}>
            ← Back
          </button>
          <button className="primary-btn" disabled={status === "processing"} onClick={handlePlaceOrder}>
            {status === "processing" ? "Placing order…" : `Place order · $${total.toFixed(2)}`}
          </button>
        </div>
      )}

      {status === "processing" && (
        <div className="qb-processing-overlay">
          <div className="qb-processing-card">
            <div className="qb-spinner" />
            <h3>Processing your payment…</h3>
            <p>Hang tight, this only takes a moment.</p>
          </div>
        </div>
      )}
    </div>
  );
}
