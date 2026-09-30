import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="qb-auth">
      <div className="qb-auth-art" style={{ backgroundImage: "url(/images/hero/dish.jpg)" }}>
        <Link to="/" className="qb-auth-brand">
          <Logo size={36} />
        </Link>
        <div className="qb-auth-art-copy">
          <h2>Craving something good?</h2>
          <p>Join thousands ordering from the best local restaurants, delivered in minutes.</p>
        </div>
      </div>
      <div className="qb-auth-form-side">
        <div className="qb-auth-card">
          <h1>{title}</h1>
          {subtitle && <p className="qb-auth-subtitle">{subtitle}</p>}
          {children}
          {footer && <p className="qb-auth-footer">{footer}</p>}
        </div>
      </div>
    </div>
  );
}
