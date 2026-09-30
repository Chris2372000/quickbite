import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CustomerSidebar from "../components/CustomerSidebar";
import Footer from "../components/Footer";

const SHORTCUTS = [
  { to: "/orders", icon: "🧾", label: "Orders" },
  { to: "/favorites", icon: "♥", label: "Favorites" },
  { to: "/addresses", icon: "📍", label: "Addresses" },
  { to: "/payment-methods", icon: "💳", label: "Payment methods" },
  { to: "/notifications", icon: "🔔", label: "Notifications" },
  { to: "/settings", icon: "⚙", label: "Settings" },
];

export default function Profile() {
  const { user } = useAuth();

  if (!user)
    return (
      <div className="qb-empty" style={{ maxWidth: 420, margin: "60px auto" }}>
        <span>👤</span>
        <h3>Please log in</h3>
        <Link to="/login" className="primary-btn" style={{ display: "inline-block", marginTop: 14 }}>
          Log in
        </Link>
      </div>
    );

  return (
    <>
      <main className="customer-page">
        <CustomerSidebar />
        <section className="customer-main">
          <div className="breadcrumbs">⌂ Home 　›　 My Account 　›　 Profile</div>
          <div className="notification-hero">
            <div>
              <span className="eyebrow">👤 MY ACCOUNT</span>
              <h1>{user.name}</h1>
              <p>{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
            </div>
            <button className="primary-btn">Edit profile</button>
          </div>

          <div className="qb-shortcut-grid">
            {SHORTCUTS.map((s) => (
              <Link key={s.to} to={s.to} className="qb-shortcut-card">
                <span>{s.icon}</span>
                {s.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
