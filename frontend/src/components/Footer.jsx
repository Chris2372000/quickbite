import { Link } from "react-router-dom";
import Logo from "./Logo";

const noop = (e) => e.preventDefault();

export default function Footer() {
  return (
    <footer className="qbf">
      <div className="qbf-grid">
        <div className="qbf-intro">
          <Logo size={36} />
          <p>
            Craving restaurant-grade culinary craft delivered swiftly to your doorstep. Every dish crafted with
            perfection, delivered in minutes.
          </p>
          <div className="qbf-stores">
            <a href="#" onClick={noop} className="qbf-store">
              <span aria-hidden="true">⇩</span>
              <span><small>Download on</small><b>App Store</b></span>
            </a>
            <a href="#" onClick={noop} className="qbf-store">
              <span aria-hidden="true">▶</span>
              <span><small>Get it on</small><b>Google Play</b></span>
            </a>
          </div>
        </div>

        <nav className="qbf-col" aria-label="Company">
          <h4>Company</h4>
          <a href="#" onClick={noop}>About Us</a>
          <a href="#" onClick={noop}>Careers</a>
          <Link to="/restaurant">Partner With Us</Link>
          <a href="#" onClick={noop}>Press &amp; Media</a>
        </nav>

        <nav className="qbf-col" aria-label="Cuisines">
          <h4>Cuisines</h4>
          <Link to="/restaurants?q=pizza">Italian &amp; Pizza</Link>
          <Link to="/restaurants?q=japanese">Japanese &amp; Sushi</Link>
          <Link to="/restaurants?q=tacos">Tacos &amp; Mexican</Link>
          <Link to="/restaurants?q=bowl">Bowls &amp; Salads</Link>
        </nav>

        <nav className="qbf-col" aria-label="Support">
          <h4>Support</h4>
          <a href="#" onClick={noop}>Help Center</a>
          <a href="#" onClick={noop}>Privacy Policy</a>
          <a href="#" onClick={noop}>Terms of Service</a>
          <a href="#" onClick={noop}>Live Support</a>
        </nav>
      </div>

      <div className="qbf-bottom">
        <span>© {new Date().getFullYear()} QuickBite Inc. All rights reserved.</span>
        <span className="qbf-legal">
          <a href="#" onClick={noop}>Privacy</a>
          <a href="#" onClick={noop}>Terms</a>
          <a href="#" onClick={noop}>Cookies</a>
          <a href="#" onClick={noop}>Security</a>
        </span>
      </div>
    </footer>
  );
}
