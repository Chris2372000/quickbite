import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Logo from "./Logo";

const I = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
const MenuIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" {...I}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
const CloseIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" {...I}><path d="M6 6l12 12M18 6L6 18" /></svg>);
const SearchIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" {...I}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>);
const FilterIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" {...I}><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></svg>);
const CartIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" {...I}><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6" /><circle cx="9.5" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /></svg>);

const MAIN_LINKS = [
  { to: "/restaurants", label: "Restaurants" },
  { to: "/offers", label: "Offers" },
  { to: "/orders", label: "Orders" },
];
const ACCOUNT_LINKS = [
  { to: "/favorites", label: "Favorites" },
  { to: "/addresses", label: "Saved addresses" },
  { to: "/payment-methods", label: "Payment methods" },
  { to: "/notifications", label: "Notifications" },
  { to: "/settings", label: "Settings" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const itemCount = cartItems.reduce((n, i) => n + i.quantity, 0);

  const [open, setOpen] = useState(false); // mobile drawer
  const [compact, setCompact] = useState(false); // hide the search row while scrolling down (mobile)
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  const closeRef = useRef(null);
  const searchFocused = useRef(false);

  // Keep the box in sync with ?q= on the restaurants page
  useEffect(() => {
    if (pathname.startsWith("/restaurants")) setQ(new URLSearchParams(search).get("q") || "");
  }, [pathname, search]);

  // Close the drawer whenever the page changes
  useEffect(() => setOpen(false), [pathname]);

  // Drawer: lock page scroll, close on Escape, move focus into it
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Mobile: tuck the search row away when scrolling down, bring it back when scrolling up
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (searchFocused.current || y < 40 || y < last - 6) setCompact(false);
        else if (y > last + 6) setCompact(true);
        last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/restaurants?q=${encodeURIComponent(term)}` : "/restaurants");
    inputRef.current?.blur();
  }

  function handleLogout() {
    setOpen(false);
    logout();
    navigate("/login");
  }

  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U";
  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <>
      <header className={`qbh${compact ? " qbh--compact" : ""}`}>
        <div className="qbh-inner">
          <button type="button" className="qbh-menu-btn" aria-label="Open menu" aria-expanded={open} aria-controls="qbh-drawer" onClick={() => setOpen(true)}>
            <MenuIcon />
          </button>

          <Link to="/" className="qbh-brand" aria-label="QuickBite home">
            <Logo size={34} />
          </Link>

          <form className="qbh-search" role="search" onSubmit={handleSearch}>
            <SearchIcon />
            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              placeholder="Search dishes, restaurants…"
              aria-label="Search dishes, restaurants, or cuisines"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => { searchFocused.current = true; setCompact(false); }}
              onBlur={() => { searchFocused.current = false; }}
            />
            <Link to="/restaurants" className="qbh-filters" aria-label="Filters">
              <FilterIcon />
              <span>Filters</span>
            </Link>
          </form>

          <nav className="qbh-nav" aria-label="Main">
            {MAIN_LINKS.map((l) => (
              <Link key={l.to} to={l.to} className={isActive(l.to) ? "active" : ""}>{l.label}</Link>
            ))}
          </nav>

          <div className="qbh-actions">
            <Link to="/cart" className={`qbh-cart${pathname === "/cart" ? " active" : ""}`} aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}>
              <CartIcon />
              <span className="qbh-cart-label">Cart</span>
              {itemCount > 0 && <i>{itemCount > 99 ? "99+" : itemCount}</i>}
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="qbh-avatar" aria-label="My profile">{initials}</Link>
                <button type="button" className="qbh-logout" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link to="/login" className="qbh-login">Login</Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile / tablet menu. Lives outside <header> so it can cover the whole screen. */}
      <div className={`qbh-overlay${open ? " open" : ""}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside id="qbh-drawer" className={`qbh-drawer${open ? " open" : ""}`} aria-label="Menu" aria-hidden={!open}>
        <div className="qbh-drawer-head">
          <Logo size={32} />
          <button ref={closeRef} type="button" className="qbh-menu-btn show" aria-label="Close menu" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        {user && (
          <Link to="/profile" className="qbh-drawer-user">
            <span className="qbh-avatar">{initials}</span>
            <span><b>{user.name || "My account"}</b><small>View profile</small></span>
          </Link>
        )}

        <nav className="qbh-drawer-nav">
          <Link to="/" className={pathname === "/" ? "active" : ""}>Home</Link>
          {MAIN_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={isActive(l.to) ? "active" : ""}>{l.label}</Link>
          ))}
          <Link to="/cart" className={pathname === "/cart" ? "active" : ""}>
            Cart{itemCount > 0 && <em>{itemCount}</em>}
          </Link>
          {user && (
            <>
              <p className="qbh-drawer-label">My account</p>
              {ACCOUNT_LINKS.map((l) => (
                <Link key={l.to} to={l.to} className={isActive(l.to) ? "active" : ""}>{l.label}</Link>
              ))}
              {["admin", "staff"].includes(user.role) && <Link to="/admin" className={isActive("/admin") ? "active" : ""}>Kitchen &amp; admin</Link>}
            </>
          )}
        </nav>

        <div className="qbh-drawer-foot">
          {user ? (
            <button type="button" className="qbh-drawer-btn ghost" onClick={handleLogout}>Log out</button>
          ) : (
            <>
              <Link to="/login" className="qbh-drawer-btn">Log in</Link>
              <Link to="/signup" className="qbh-drawer-btn ghost">Create account</Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
