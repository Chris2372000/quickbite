import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CustomerSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return <aside className="customer-sidebar">
    <div className="customer-mini-profile">
      <div className="avatar-photo">{user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "AJ"}</div>
      <div><b>{user?.name || "Alex Johnson"}</b><span>{user?.email || "alex.johnson@example.com"}</span></div>
    </div>
    <nav>
      <NavLink to="/profile">Profile</NavLink>
      <NavLink to="/orders">Orders</NavLink>
      <NavLink to="/offers">Offers</NavLink>
      <NavLink to="/favorites">Favorites</NavLink>
      <NavLink to="/addresses">Saved Addresses</NavLink>
      <NavLink to="/payment-methods">Payment Methods</NavLink>
      <NavLink to="/notifications">Notifications</NavLink>
      <NavLink to="/settings">Settings</NavLink>
    </nav>
    <button type="button" className="customer-logout" onClick={handleLogout}>↪ <span>Logout</span></button>
  </aside>;
}
