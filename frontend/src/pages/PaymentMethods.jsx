import { useState } from "react";
import CustomerSidebar from "../components/CustomerSidebar";
import Footer from "../components/Footer";
import { usePaymentMethods } from "../context/PaymentMethodsContext";

const BRAND_ICON = { Visa: "💳", Mastercard: "💳", "Cash on delivery": "💵", "Mobile Money": "📱" };

export default function PaymentMethods() {
  const { methods, addMethod, deleteMethod, setDefaultMethod } = usePaymentMethods();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ brand: "Visa", number: "", expiry: "" });

  function handleAdd(e) {
    e.preventDefault();
    addMethod({ type: "card", brand: form.brand, last4: form.number.slice(-4), expiry: form.expiry });
    setForm({ brand: "Visa", number: "", expiry: "" });
    setShowForm(false);
  }

  return (
    <>
      <main className="customer-page">
        <CustomerSidebar />
        <section className="customer-main">
          <div className="breadcrumbs">⌂ Home 　›　 My Account 　›　 Payment Methods</div>
          <div className="notification-hero">
            <div>
              <span className="eyebrow">💳 CHECKOUT FASTER</span>
              <h1>Payment Methods</h1>
              <p>Manage the cards and other ways you pay for your orders.</p>
            </div>
            <button className="primary-btn" onClick={() => setShowForm(true)}>
              + Add card
            </button>
          </div>

          <div className="qb-address-grid">
            {methods.map((m) => (
              <div key={m.id} className="qb-address-card">
                <div className="qb-address-card-top">
                  <b>
                    {BRAND_ICON[m.brand] || "💳"} {m.brand}
                  </b>
                  {m.isDefault && <span className="green-pill">Default</span>}
                </div>
                {m.last4 && <p>•••• •••• •••• {m.last4}</p>}
                {m.expiry && <p className="muted-line">Expires {m.expiry}</p>}
                <div className="qb-address-actions">
                  {!m.isDefault && <button onClick={() => setDefaultMethod(m.id)}>Set default</button>}
                  <button className="danger" onClick={() => deleteMethod(m.id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="restaurant-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>Add card</h2>
              <a onClick={() => setShowForm(false)}>×</a>
            </div>
            <form onSubmit={handleAdd} className="form-grid">
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
                Save card
              </button>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
