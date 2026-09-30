import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerSidebar from "../components/CustomerSidebar";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { useCheckout } from "../context/CheckoutContext";
import "../styles/notifications.css";

const KIND_ICON = { delivery: "truck", kitchen: "utensils", deal: "tag", security: "shield", completed: "checkCircle" };
const CATEGORIES = [
  ["all", "All"],
  ["orders", "Orders"],
  ["promotions", "Promotions & Deals"],
  ["account", "Account & Security"],
];

const SEED = [
  { id: 1, category: "orders", kind: "delivery", tag: "Urgent", title: "Your order #QB-8841-TB is out for delivery!", time: "4 mins ago", unread: true, text: "Marcus Vance is 8 minutes away with your meal from The Truffle Burger Co. Get ready at the door!", product: { emoji: "🍔", title: "1× Double Truffle Smash Combo + Truffle Fries", sub: "Courier: Marcus · Honda scooter · Plate QB-88" }, cta: { label: "Track Live Order", to: "/orders" } },
  { id: 2, category: "orders", kind: "kitchen", title: "Kitchen began prepping your artisanal burger", time: "22 mins ago", unread: true, text: "The Truffle Burger Co. verified your customization note: “Medium rare please.” Chef Marco has taken your ticket." },
  { id: 3, category: "promotions", kind: "deal", tag: "20% OFF", title: "Weekend Craving: 20% off all wood-fired pizzas", time: "3 hours ago", unread: true, text: "Use code BOGOPIZZA at checkout for orders over $40 from Fire & Stone Neapolitan.", product: { emoji: "🍕", title: "Fire & Stone Neapolitan · ★ 4.9", sub: "Valid across artisanal personal pies, calzones, and craft gelato." }, cta: { label: "Claim code: BOGOPIZZA", code: "BOGOPIZZA" } },
  { id: 4, category: "account", kind: "security", tag: "Security", title: "New login detected from Springfield, IL", time: "Yesterday, 4:15 PM", unread: false, text: "QuickBite Web on Chrome (macOS) verified via two-factor authentication. If this wasn't you, change your password right away.", cta: { label: "Review account security", to: "/settings" } },
  { id: 5, category: "orders", kind: "completed", tag: "Completed", title: "Order #QB-8201-FS delivered successfully", time: "Oct 24, 2024", unread: false, text: "Enjoy your Margherita D.O.P. Pizza from Fire & Stone! Rate your meal to earn +25 QuickBite reward points toward your next dessert." },
];

const PREFS = [
  { key: "sms", title: "SMS Alerts", text: "Order updates & driver text" },
  { key: "push", title: "Push Notifications", text: "Live GPS tracking alerts" },
  { key: "weekly", title: "Weekly Discounts", text: "Promos & chef editorial digests" },
];

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Notifications() {
  const { user } = useAuth();
  const { setPromoCode } = useCheckout();
  const navigate = useNavigate();
  const [items, setItems] = useState(() => load("quickbite_notifications", SEED));
  const [tab, setTab] = useState("all");
  const [prefs, setPrefs] = useState(() => load("quickbite_notification_prefs", { sms: true, push: true, weekly: false }));
  const [toast, setToast] = useState("");

  useEffect(() => localStorage.setItem("quickbite_notifications", JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem("quickbite_notification_prefs", JSON.stringify(prefs)), [prefs]);

  const firstName = user?.name?.split(" ")[0] || "there";
  const unreadIn = (cat) => items.filter((n) => n.unread && (cat === "all" || n.category === cat)).length;
  const visible = items.filter((n) => tab === "all" || n.category === tab);
  const liveOrder = items.find((n) => n.kind === "delivery" && n.unread);

  const markRead = (id) => setItems((l) => l.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  const dismiss = (id) => setItems((l) => l.filter((n) => n.id !== id));
  const markAll = () => setItems((l) => l.map((n) => ({ ...n, unread: false })));

  function handleCta(n) {
    markRead(n.id);
    if (n.cta.code) {
      setPromoCode(n.cta.code);
      setToast(`${n.cta.code} applied — it will be used at checkout.`);
      setTimeout(() => setToast(""), 2600);
    } else if (n.cta.to) {
      navigate(n.cta.to);
    }
  }

  return (
    <>
      <main className="customer-page">
        <CustomerSidebar />
        <section className="customer-main">
          <div className="breadcrumbs"><Icon name="home" size={13} /> Home 　›　 My Account 　›　 Notification Center</div>

          <div className="nc-hero">
            <div>
              <span className="nc-eyebrow"><Icon name="bell" size={13} /> ACTIVITY CENTER</span>
              <h1>Notification Center</h1>
              <p>Stay updated on live deliveries, kitchen status, promo codes, and account activity, {firstName}.</p>
            </div>
            {liveOrder && (
              <Link to="/orders" className="nc-live">
                <span><i /> LIVE EN ROUTE</span>
                <strong>8 min away</strong>
              </Link>
            )}
          </div>

          <div className="nc-grid">
            <div className="nc-main">
              <div className="nc-tabs">
                {CATEGORIES.map(([key, label]) => (
                  <button key={key} className={tab === key ? "on" : ""} onClick={() => setTab(key)}>
                    {label}
                    {unreadIn(key) > 0 ? <em>{unreadIn(key)} new</em> : <small>({items.filter((n) => key === "all" || n.category === key).length})</small>}
                  </button>
                ))}
                <button className="nc-markall" onClick={markAll} disabled={!unreadIn("all")}>
                  <Icon name="check" size={14} /> Mark all as read
                </button>
              </div>

              {visible.length === 0 ? (
                <div className="nc-empty">
                  <Icon name="bell" size={30} />
                  <h3>You're all caught up</h3>
                  <p>New order updates, deals and account alerts will show up here.</p>
                  {items.length === 0 && <button onClick={() => setItems(SEED)}>Restore sample notifications</button>}
                </div>
              ) : (
                visible.map((n) => (
                  <article key={n.id} className={`nc-item ${n.kind}${n.unread ? " unread" : ""}`}>
                    <span className="nc-icon"><Icon name={KIND_ICON[n.kind]} size={20} /></span>
                    <div className="nc-body">
                      <div className="nc-title">
                        {n.tag && <em>{n.tag}</em>}
                        <strong>{n.title}</strong>
                        {n.unread && <i className="nc-dot" aria-label="Unread" />}
                        <small>{n.time}</small>
                      </div>
                      <p>{n.text}</p>
                      {n.product && (
                        <div className="nc-product">
                          <span>{n.product.emoji}</span>
                          <div><b>{n.product.title}</b><small>{n.product.sub}</small></div>
                        </div>
                      )}
                      <div className="nc-actions">
                        {n.cta && <button className="nc-cta" onClick={() => handleCta(n)}>{n.cta.label}</button>}
                        {n.unread && <button onClick={() => markRead(n.id)}>Mark as read</button>}
                        <button onClick={() => dismiss(n.id)}>Dismiss</button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            <aside className="nc-side">
              <h3><Icon name="sliders" size={16} /> Preferences <small>Instant Sync</small></h3>
              <p>Choose how you hear about urgent kitchen, courier, and savings updates.</p>
              {PREFS.map((p) => (
                <div className="nc-pref" key={p.key}>
                  <div><b>{p.title}</b><small>{p.text}</small></div>
                  <button
                    role="switch"
                    aria-checked={prefs[p.key]}
                    aria-label={p.title}
                    className={`nc-switch${prefs[p.key] ? " on" : ""}`}
                    onClick={() => setPrefs((s) => ({ ...s, [p.key]: !s[p.key] }))}
                  ><i /></button>
                </div>
              ))}
              <Link to="/settings" className="nc-manage">Manage all communication channels →</Link>
              <div className="nc-help">
                <b><Icon name="message" size={15} /> Need assistance? <small>Live 24/7</small></b>
                <p>Having an issue with a delivery or an order customization? Our support team is ready in chat.</p>
                <button><Icon name="message" size={14} /> Start instant chat</button>
              </div>
            </aside>
          </div>
        </section>
      </main>
      {toast && <div className="nc-toast"><Icon name="checkCircle" size={16} /> {toast}</div>}
      <Footer />
    </>
  );
}
