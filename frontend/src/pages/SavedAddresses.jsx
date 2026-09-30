import { useState } from "react";
import CustomerSidebar from "../components/CustomerSidebar";
import Footer from "../components/Footer";
import { useAddresses } from "../context/AddressesContext";

const EMPTY = { label: "", line1: "", line2: "", city: "", instructions: "" };

export default function SavedAddresses() {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddresses();
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  function startAdd() {
    setForm(EMPTY);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(a) {
    setForm(a);
    setEditingId(a.id);
    setShowForm(true);
  }

  function handleSave(e) {
    e.preventDefault();
    if (editingId) updateAddress(editingId, form);
    else addAddress(form);
    setShowForm(false);
  }

  return (
    <>
      <main className="customer-page">
        <CustomerSidebar />
        <section className="customer-main">
          <div className="breadcrumbs">⌂ Home 　›　 My Account 　›　 Saved Addresses</div>
          <div className="notification-hero">
            <div>
              <span className="eyebrow">📍 DELIVERY LOCATIONS</span>
              <h1>Saved Addresses</h1>
              <p>Keep your home, work, and other frequent drop-off points ready for checkout.</p>
            </div>
            <button className="primary-btn" onClick={startAdd}>
              + Add address
            </button>
          </div>

          <div className="qb-address-grid">
            {addresses.map((a) => (
              <div key={a.id} className="qb-address-card">
                <div className="qb-address-card-top">
                  <b>{a.label}</b>
                  {a.isDefault && <span className="green-pill">Default</span>}
                </div>
                <p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
                <p className="muted-line">{a.city}</p>
                {a.instructions && <p className="muted-line">Note: {a.instructions}</p>}
                <div className="qb-address-actions">
                  {!a.isDefault && <button onClick={() => setDefaultAddress(a.id)}>Set default</button>}
                  <button onClick={() => startEdit(a)}>Edit</button>
                  <button className="danger" onClick={() => deleteAddress(a.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!addresses.length && (
              <div className="qb-empty">
                <span>📍</span>
                <h3>No saved addresses</h3>
                <p>Add one so checkout is faster next time.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="restaurant-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editingId ? "Edit address" : "Add address"}</h2>
              <a onClick={() => setShowForm(false)}>×</a>
            </div>
            <form onSubmit={handleSave} className="form-grid">
              <label>
                Label (Home, Work…)
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
              <label style={{ gridColumn: "1 / -1" }}>
                Delivery instructions (optional)
                <textarea
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                />
              </label>
              <button className="primary-btn full" style={{ gridColumn: "1 / -1" }}>
                Save address
              </button>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
