import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import socket from "../api/socket";
import { useCart } from "../context/CartContext";
import DishThumb from "../components/DishThumb";
import Footer from "../components/Footer";
import {
  ACTIVE_STATUSES,
  STATUS_LABELS,
  etaDate,
  fmtDateTime,
  fmtTime,
  itemCount,
  itemsSummary,
  money,
  orderCode,
  paymentLabel,
  stageIndex,
  useRestaurant,
} from "../data/orderMeta";

const TABS = [
  { key: "all", label: "All Orders" },
  { key: "active", label: "Active / In-Transit" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled & Refunded" },
];
const PERIODS = [
  { key: 30, label: "Past 30 days" },
  { key: 90, label: "Past 90 days" },
  { key: 0, label: "All time" },
];
const PAGE_SIZE = 5;
const PROGRESS_LABELS = ["Order Confirmed", "Prepared & Boxed", "Out for Delivery", "Arrived"];

export default function OrderHistory() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const restaurant = useRestaurant();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState(0);
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    let mounted = true;

    client
      .get("/orders/mine")
      .then((res) => {
        if (!mounted) return;
        const loaded = res.data.orders || [];
        setOrders(loaded);
        // Subscribe to every active order so this bar is driven by the kitchen/admin status.
        loaded
          .filter((o) => ACTIVE_STATUSES.includes(o.status))
          .forEach((o) => socket.emit("order:watch", o._id));
      })
      .finally(() => mounted && setLoading(false));

    function onStatus(p) {
      if (!p?.orderId) return;
      setOrders((current) =>
        current.map((o) =>
          o._id === p.orderId
            ? {
                ...o,
                status: p.status,
                statusHistory: [
                  ...(o.statusHistory || []),
                  { status: p.status, at: new Date().toISOString() },
                ],
              }
            : o
        )
      );
    }

    socket.on("order:status", onStatus);
    return () => {
      mounted = false;
      socket.off("order:status", onStatus);
    };
  }, []);

  const counts = useMemo(
    () => ({
      all: orders.length,
      active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
      completed: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }),
    [orders]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = period ? Date.now() - period * 86400000 : 0;
    return orders.filter((o) => {
      if (cutoff && new Date(o.createdAt).getTime() < cutoff) return false;
      if (tab === "active" && !ACTIVE_STATUSES.includes(o.status)) return false;
      if (tab === "completed" && o.status !== "delivered") return false;
      if (tab === "cancelled" && o.status !== "cancelled") return false;
      if (q) {
        const hay = `${orderCode(o._id)} ${itemsSummary(o)} ${restaurant.name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [orders, tab, query, period, restaurant.name]);

  const activeOrders = filtered.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const pastOrders = filtered.filter((o) => !ACTIVE_STATUSES.includes(o.status));
  const shownPast = pastOrders.slice(0, visible);
  const totalSpent = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  function reorder(order) {
    order.items.forEach((i) =>
      addToCart({
        menuItem: i.menuItem,
        name: i.name,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        selectedModifiers: i.selectedModifiers,
        notes: i.notes,
      })
    );
    navigate("/cart");
  }

  function exportCsv() {
    const rows = [["Order", "Date", "Status", "Items", "Subtotal", "Tax", "Delivery", "Total"]];
    filtered.forEach((o) =>
      rows.push([
        orderCode(o._id),
        new Date(o.createdAt).toISOString(),
        o.status,
        `"${itemsSummary(o).replace(/"/g, '""')}"`,
        o.subtotal,
        o.tax,
        o.deliveryFee,
        o.total,
      ])
    );
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "quickbite-orders.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <main className="qb-hist">
        <header className="qb-hist-head">
          <div>
            <span className="qb-pill red">CUSTOMER DASHBOARD</span> <span className="muted-line">• QuickBite Premium Deliveries</span>
            <h1>My Orders &amp; History</h1>
            <p>Track current deliveries, review past culinary orders, and easily reorder your favorites in 1 click.</p>
          </div>
          <div className="qb-hist-stat">
            <span className="qb-rest-line-icon">🍴</span>
            <div>
              <b>{orders.length} Orders</b>
              <small>{money(totalSpent)} spent in total</small>
            </div>
          </div>
        </header>

        <div className="qb-hist-tools">
          <label className="qb-hist-search">
            ⌕
            <input placeholder="Search by item or order ID…" value={query} onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }} />
          </label>
          <select value={period} onChange={(e) => { setPeriod(Number(e.target.value)); setVisible(PAGE_SIZE); }}>
            {PERIODS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
          <button className="qb-secondary-btn" onClick={exportCsv} disabled={!filtered.length}>⇩ Export Orders</button>
        </div>

        <div className="qb-hist-tabs">
          {TABS.map((t) => (
            <button key={t.key} className={tab === t.key ? "on" : ""} onClick={() => { setTab(t.key); setVisible(PAGE_SIZE); }}>
              {t.label} <i>{counts[t.key]}</i>
            </button>
          ))}
        </div>

        {loading && <p className="qb-empty-inline">Loading your orders…</p>}

        {!loading && !filtered.length && (
          <div className="qb-empty">
            <span>🧾</span>
            <h3>No orders found</h3>
            <p>{orders.length ? "Try a different filter or search." : "When you place an order it will show up here."}</p>
            <Link to="/restaurants" className="primary-btn" style={{ display: "inline-block", marginTop: 14 }}>Browse restaurants</Link>
          </div>
        )}

        {activeOrders.map((o) => {
          const stage = stageIndex(o.status);
          const pct = [25, 55, 80, 100][stage] ?? 10;
          return (
            <section key={o._id} className="qb-active-order">
              <div className="qb-active-top">
                <span><i className="qb-live-dot" /> <b>Active Order in Progress</b> <em>#{orderCode(o._id)}</em></span>
                <span className="qb-pill amber">🛵 {STATUS_LABELS[o.status]} · Est. {fmtTime(etaDate(o))}</span>
              </div>
              <div className="qb-active-progress">
                <div className="qb-active-labels">
                  {PROGRESS_LABELS.map((l, i) => <span key={l} className={i <= stage ? "on" : ""}>{i < stage ? "✓ " : ""}{l}</span>)}
                </div>
                <div className="qb-progress big"><i style={{ width: `${pct}%` }} /></div>
              </div>
              <div className="qb-active-body">
                <DishThumb name={o.items[0]?.name} size={88} radius={12} />
                <div className="qb-active-info">
                  <h3>{restaurant.name} <span className="green">✔</span></h3>
                  <p>{itemsSummary(o)}</p>
                  <div><span className="qb-pill">{itemCount(o)} items</span> <b>{money(o.total)}</b> <small className="muted-line">{paymentLabel(o)}</small></div>
                </div>
                <div className="qb-active-btns">
                  <Link to={`/orders/${o._id}`} className="primary-btn">➤ Track Live Delivery</Link>
                  <Link to={`/orders/${o._id}/receipt`} className="qb-soft-btn">◉ View Details</Link>
                </div>
              </div>
            </section>
          );
        })}

        {shownPast.length > 0 && (
          <>
            <div className="qb-past-head">
              <h2>Past Culinary Orders <span className="qb-pill">{pastOrders.length} Archived</span></h2>
              <small className="muted-line">Sorted by: <b>Most Recent</b></small>
            </div>
            <div className="qb-past-list">
              {shownPast.map((o) => {
                const cancelled = o.status === "cancelled";
                const refunded = cancelled && o.paymentMethod === "card" && o.paymentStatus === "paid";
                return (
                  <article key={o._id} className="qb-past-card">
                    <DishThumb name={o.items[0]?.name} size={64} radius={12} />
                    <div className="qb-past-main">
                      <div className="qb-past-meta">
                        <span className="qb-code">#{orderCode(o._id)}</span>
                        <small>{fmtDateTime(o.createdAt)}</small>
                        <span className={`qb-pill ${cancelled ? "red" : "green"}`}>{cancelled ? "✕ Cancelled" : "✓ Delivered"}</span>
                      </div>
                      <h3>{restaurant.name}</h3>
                      <p>{itemCount(o)} items: {itemsSummary(o)}</p>
                      <div className="qb-past-price"><b>{money(o.total)}</b> <small>• {paymentLabel(o)}</small></div>
                    </div>
                    <div className="qb-past-side">
                      {cancelled ? (
                        <div className="qb-past-note">
                          <b>{refunded ? "100% Refund Complete" : "No charge made"}</b>
                          <small>{refunded ? "Credited back to your original payment" : "This order was never paid"}</small>
                        </div>
                      ) : (
                        <div className="qb-past-note">
                          <b>Delivered</b>
                          <small>{o.deliveryAddress?.line1 ? `To ${o.deliveryAddress.line1}` : "Thanks for ordering!"}</small>
                        </div>
                      )}
                      <div className="qb-past-btns">
                        <button className={cancelled ? "qb-secondary-btn" : "primary-btn"} onClick={() => reorder(o)}>
                          ↻ {cancelled ? "Order Again" : "Reorder in 1-Click"}
                        </button>
                        <Link to={`/orders/${o._id}/receipt`} className="qb-soft-btn">▤ Receipt</Link>
                        <Link to={`/orders/${o._id}/receipt`} className="qb-soft-btn">ⓘ {cancelled ? "Refund Details" : "Details"}</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="qb-load-more">
              <small>Showing <b>{shownPast.length}</b> of <b>{pastOrders.length}</b> past orders</small>
              <div className="qb-progress"><i style={{ width: `${(shownPast.length / pastOrders.length) * 100}%` }} /></div>
              {shownPast.length < pastOrders.length && (
                <button className="qb-secondary-btn" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Load More Past Orders ⌄</button>
              )}
            </div>
          </>
        )}

        <section className="qb-hist-help">
          <span className="qb-rest-line-icon">🎧</span>
          <div>
            <b>Can't find an order or need help with a transaction?</b>
            <p>Our live concierge team is here 24/7 to resolve missing items, delivery updates, or refunds.</p>
          </div>
          <button className="qb-dark-btn">💬 Contact 24/7 Support</button>
          <button className="qb-secondary-btn">Refund Policy</button>
        </section>
      </main>
      <Footer />
    </>
  );
}
