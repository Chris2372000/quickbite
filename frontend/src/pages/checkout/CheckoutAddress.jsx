import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import CheckoutSteps from "../../components/CheckoutSteps";
import { useAddresses } from "../../context/AddressesContext";
import { useCheckout } from "../../context/CheckoutContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

export default function CheckoutAddress() {
  const { addresses, addAddress } = useAddresses();
  const { addressId, setAddressId, instructions, setInstructions } = useCheckout();
  const { cartItems } = useCart();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", line1: "", line2: "", city: "" });

  const selected = addressId || addresses.find((a) => a.isDefault)?.id || addresses[0]?.id;

  if (!loading && !user) return <Navigate to="/login" replace />;

  if (!cartItems.length) {
    return (
      <div className="qb-checkout-page">
        <p className="qb-empty-inline">Your cart is empty — add something delicious first.</p>
      </div>
    );
  }

  function handleContinue() {
    setAddressId(selected);
    navigate("/checkout/payment");
  }

  function handleAddAddress(e) {
    e.preventDefault();
    const id = addAddress(form);
    setAddressId(id);
    setShowForm(false);
    setForm({ label: "", line1: "", line2: "", city: "" });
  }

  return (
    <div className="qb-checkout-page">
      <CheckoutSteps current="address" />
      <h1>Delivery address</h1>
      <p className="qb-checkout-sub">Choose where you'd like your order delivered.</p>

      <div className="qb-address-select-list">
        {addresses.map((a) => (
          <label key={a.id} className={`qb-address-select${selected === a.id ? " on" : ""}`}>
            <input type="radio" name="address" checked={selected === a.id} onChange={() => setAddressId(a.id)} />
            <div>
              <b>{a.label}</b>
              <p>
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}, {a.city}
              </p>
            </div>
          </label>
        ))}
        <button type="button" className="qb-address-select-add" onClick={() => setShowForm(true)}>
          + Add a new address
        </button>
      </div>

      <div className="qb-checkout-group">
        <label>Delivery instructions (optional)</label>
        <input
          placeholder="e.g. Leave at the door, gate code 4021…"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>

      <button className="primary-btn full" disabled={!selected} onClick={handleContinue}>
        Continue to payment
      </button>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="restaurant-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Add address</h2>
              <a onClick={() => setShowForm(false)}>×</a>
            </div>
            <form onSubmit={handleAddAddress} className="form-grid">
              <label>
                Label
                <input required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </label>
              <label>
                City
                <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                Street address
                <input required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                Apartment / unit (optional)
                <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
              </label>
              <button className="primary-btn full" style={{ gridColumn: "1 / -1" }}>
                Save & use this address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
