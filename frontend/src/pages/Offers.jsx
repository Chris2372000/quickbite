import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import client from "../api/client";
import { useCheckout } from "../context/CheckoutContext";
import "../styles/offers.css";

export default function Offers() {
  const { promoCode, setPromoCode } = useCheckout();
  const [offers, setOffers] = useState([]), [query, setQuery] = useState(""), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  useEffect(() => { client.get("/offers").then(r => setOffers(r.data.offers || [])).catch(e => setError(e.response?.data?.error || "Could not load offers")).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => offers.filter(o => `${o.title} ${o.description} ${o.code} ${o.category}`.toLowerCase().includes(query.toLowerCase())), [offers, query]);
  const apply = code => { setPromoCode(code); };
  const copy = async code => { try { await navigator.clipboard.writeText(code); } catch {} setCopied(code); setTimeout(() => setCopied(""), 1400); };
  return <div className="of-page"><div className="of-wrap">
    <section className="offers-hero"><div><p className="offers-eyebrow">LIVE OFFERS</p><h1>Offers & Deals</h1><p>Every offer shown here comes from the QuickBite database. When an administrator creates, edits, activates or deletes an offer, customers see the live result.</p></div><Link className="offers-primary" to="/">Order now</Link></section>
    <main className="offers-content"><div className="of-filterbar"><label className="of-search"><Icon name="search" size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search live offers..."/></label></div>
    {loading ? <p>Loading live offers…</p> : error ? <p className="of-none">{error}</p> : filtered.length === 0 ? <div className="of-empty"><h3>No active offers</h3><p>There are no offers matching your search.</p></div> : <div className="offers-grid">{filtered.map(o => <article className="offer-card" key={o._id}><div className="offer-card-image">{o.imageUrl ? <img src={o.imageUrl} alt={o.title}/> : <div className="of-img-fallback"><span>🏷️</span></div>}<span>{o.badge || "Deal"}</span></div><div className="offer-card-body"><h3>{o.title}</h3><p>{o.description}</p><small>{o.type === "percent" ? `${o.value}% off` : o.type === "fixed" ? `$${o.value.toFixed(2)} off` : "Free delivery"}{o.minSubtotal ? ` · Min $${o.minSubtotal.toFixed(2)}` : ""}</small><div className="offer-code"><span>{o.code}</span><button onClick={()=>copy(o.code)}>{copied===o.code ? "Copied" : "Copy"}</button></div><button className="offer-use" onClick={()=>apply(o.code)}>{promoCode===o.code ? "Applied ✓" : "Apply at checkout"}</button></div></article>)}</div>}
    </main></div><Footer/></div>;
}
