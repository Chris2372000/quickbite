import { useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";
import CheckoutSteps from "../../components/CheckoutSteps";
import { usePaymentMethods } from "../../context/PaymentMethodsContext";
import { useCheckout } from "../../context/CheckoutContext";

const BRAND_ICON = { Visa: "💳", Mastercard: "💳", "Cash on delivery": "💵", "Mobile Money": "📱" };

export default function CheckoutPayment() {
  const { methods, addMethod } = usePaymentMethods();
  const { addressId, paymentMethodId, setPaymentMethodId } = useCheckout();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ brand: "Visa", number: "", expiry: "" });

  if (!addressId) return <Navigate to="/checkout/address" replace />;

  const selected =
    (methods.some((m) => m.id === paymentMethodId) && paymentMethodId) ||
    methods.find((m) => m.isDefault)?.id ||
    methods[0]?.id;

  function handleContinue() {
    setPaymentMethodId(selected);
    navigate("/checkout/review");
  }

  function handleAddCard(e) {
    e.preventDefault();
    const id = addMethod({ type: "card", brand: form.brand, last4: form.number.slice(-4), expiry: form.expiry });
    setPaymentMethodId(id);
    setShowForm(false);
    setForm({ brand: "Visa", number: "", expiry: "" });
  }

  return (
    <div className="qb-checkout-page">
      <CheckoutSteps current="payment" />
      <h1>Payment method</h1>
      <p className="qb-checkout-sub">Your secure payment info is encrypted and never shared with the restaurant.</p>

      <div className="qb-address-select-list">
        {methods.map((m) => (
          <label key={m.id} className={`qb-address-select${selected === m.id ? " on" : ""}`}>
            <input
              type="radio"
              name="payment"
              checked={selected === m.id}
              onChange={() => setPaymentMethodId(m.id)}
            />
            <div>
              <b>
                {BRAND_ICON[m.brand] || "💳"} {m.brand}
              </b>
              {m.last4 && <p>•••• {m.last4} {m.expiry && `· Exp ${m.expiry}`}</p>}
            </div>
          </label>
        ))}
        <button type="button" className="qb-address-select-add" onClick={() => setShowForm(true)}>
          + Add a new card
        </button>
      </div>

      <p className="qb-secure-note">🔒 Payments are processed securely — card details are never stored on our servers.</p>

      <div className="qb-checkout-nav">
        <button className="qb-secondary-btn" onClick={() => navigate("/checkout/address")}>
          ← Back
        </button>
        <button className="primary-btn" disabled={!selected} onClick={handleContinue}>
          Continue to review
        </button>
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="restaurant-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Add card</h2>
              <a onClick={() => setShowForm(false)}>×</a>
            </div>
            <form onSubmit={handleAddCard} className="form-grid">
              <label>
                Card brand
                <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}>
                  <option>Visa</option>
                  <option>Mastercard</option>
                </select>
              </label>
              <label>
                Expiry (MM/YY)
                <input required placeholder="09/28" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                Card number
                <input
                  required
                  placeholder="4242 4242 4242 4242"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                />
              </label>
              <button className="primary-btn full" style={{ gridColumn: "1 / -1" }}>
                Save & use this card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
