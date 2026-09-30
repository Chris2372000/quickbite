import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import client from "../../api/client";
import socket from "../../api/socket";
import { useAuth } from "../../context/AuthContext";

const COLUMNS = [
  { key: "placed", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "ready_for_pickup", label: "Ready" },
  { key: "out_for_delivery", label: "Out for delivery" },
];

const nextStatus = (status) => {
  const i = COLUMNS.findIndex((c) => c.key === status);
  return i >= 0 && i < COLUMNS.length - 1 ? COLUMNS[i + 1].key : null;
};

function MenuEditor({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { name: "", category: "Burgers", price: "", active: true, description: "", imageUrl: "" });
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  return (
    <div className="admin-modal-backdrop">
      <form className="admin-modal" onSubmit={(e) => { e.preventDefault(); onSave({ ...form, price: Number(form.price), isAvailable: form.active }); }}>
        <div className="admin-modal-head"><div><span className="eyebrow">MENU ITEM</span><h2>{item ? "Edit food item" : "Add food item"}</h2></div><button type="button" onClick={onClose}>×</button></div>
        <div className="admin-form-grid">
          <label>Food name<input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Truffle Burger" /></label>
          <label>Category<select value={form.category} onChange={(e) => update("category", e.target.value)}><option>Burgers</option><option>Pizza</option><option>Sandwiches</option><option>Salads</option><option>Drinks</option><option>Desserts</option></select></label>
          <label>Price<input required min="0" step="0.01" type="number" value={form.price} onChange={(e) => update("price", e.target.value)} /></label>
          <label>Available stock<input min="0" type="number" value={form.stock} onChange={(e) => update("stock", e.target.value)} /></label>
          <label className="admin-form-full">Description<textarea rows="4" value={form.description} onChange={(e) => update("description", e.target.value)} /></label>
          <label className="admin-check"><input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} /> Available to customers</label>
        </div>
        <div className="admin-modal-actions"><button type="button" className="admin-btn secondary" onClick={onClose}>Cancel</button><button className="admin-btn primary">{item ? "Save changes" : "Create food item"}</button></div>
      </form>
    </div>
  );
}

function MenuManagement() {
  const [items,setItems]=useState([]),[search,setSearch]=useState(""),[editing,setEditing]=useState(undefined),[loading,setLoading]=useState(true);
  const load=()=>client.get("/menu?all=true").then(r=>setItems(r.data.items||[])).finally(()=>setLoading(false));
  useEffect(()=>{load().catch(()=>{});},[]);
  const save=async item=>{try{const payload={...item,price:Number(item.price),isAvailable:!!item.active,slug:item.slug||undefined};delete payload._id; if(item._id) await client.put(`/menu/${item._id}`,payload); else await client.post("/menu",payload);setEditing(undefined);load();}catch(e){alert(e.response?.data?.details||e.response?.data?.error||"Could not save menu item");}};
  const remove=async id=>{if(window.confirm("Delete this food item?")){await client.delete(`/menu/${id}`);load();}};
  const toggle=async item=>{await client.put(`/menu/${item._id}`,{isAvailable:!item.isAvailable});load();};
  const filtered=items.filter(x=>`${x.name} ${x.category}`.toLowerCase().includes(search.toLowerCase()));
  return <><div className="admin-toolbar"><div className="admin-search">⌕<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search food, category..."/></div><button className="admin-btn primary" onClick={()=>setEditing(null)}>+ Add food item</button></div><section className="admin-card"><div className="admin-card-head"><div><h2>Food & Menu Management</h2><p>Live menu data from MongoDB.</p></div><span className="admin-count">{items.length} items</span></div>{loading?<p>Loading…</p>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Food item</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map(item=><tr key={item._id}><td><b>{item.name}</b><small>{item.description}</small></td><td>{item.category}</td><td><strong>${Number(item.price).toFixed(2)}</strong></td><td><button className={`admin-status ${item.isAvailable?"on":"off"}`} onClick={()=>toggle(item)}>{item.isAvailable?"Active":"Hidden"}</button></td><td><div className="admin-actions"><button onClick={()=>setEditing({...item,active:item.isAvailable})}>Edit</button><button className="danger" onClick={()=>remove(item._id)}>Delete</button></div></td></tr>)}</tbody></table></div>}</section>{editing!==undefined&&<MenuEditor item={editing||undefined} onClose={()=>setEditing(undefined)} onSave={save}/>}</>;
}

function OfferEditor({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || { title:"", description:"", code:"", type:"percent", value:10, minSubtotal:0, maxDiscount:"", active:true, startsAt:"", endsAt:"", imageUrl:"", badge:"Deal", category:"all" });
  const update=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{e.preventDefault(); onSave({...form,value:Number(form.value)||0,minSubtotal:Number(form.minSubtotal)||0,maxDiscount:form.maxDiscount===""?null:Number(form.maxDiscount),startsAt:form.startsAt||null,endsAt:form.endsAt||null});};
  return <div className="admin-modal-backdrop"><form className="admin-modal" onSubmit={submit}><div className="admin-modal-head"><div><span className="eyebrow">LIVE OFFER</span><h2>{item?"Edit offer":"Create offer"}</h2></div><button type="button" onClick={onClose}>×</button></div><div className="admin-form-grid"><label>Title<input required value={form.title} onChange={e=>update("title",e.target.value)}/></label><label>Promo code<input required value={form.code} onChange={e=>update("code",e.target.value.toUpperCase())}/></label><label>Description<input value={form.description} onChange={e=>update("description",e.target.value)}/></label><label>Badge<input value={form.badge} onChange={e=>update("badge",e.target.value)}/></label><label>Discount type<select value={form.type} onChange={e=>update("type",e.target.value)}><option value="percent">Percentage</option><option value="fixed">Fixed amount</option><option value="delivery">Free delivery</option></select></label><label>Value<input type="number" min="0" step="0.01" value={form.value} onChange={e=>update("value",e.target.value)}/></label><label>Minimum subtotal<input type="number" min="0" step="0.01" value={form.minSubtotal} onChange={e=>update("minSubtotal",e.target.value)}/></label><label>Max discount<input type="number" min="0" step="0.01" value={form.maxDiscount ?? ""} onChange={e=>update("maxDiscount",e.target.value)}/></label><label>Start date<input type="datetime-local" value={form.startsAt?new Date(form.startsAt).toISOString().slice(0,16):""} onChange={e=>update("startsAt",e.target.value)}/></label><label>End date<input type="datetime-local" value={form.endsAt?new Date(form.endsAt).toISOString().slice(0,16):""} onChange={e=>update("endsAt",e.target.value)}/></label><label className="admin-form-full">Image URL<input value={form.imageUrl} onChange={e=>update("imageUrl",e.target.value)}/></label><label className="admin-check"><input type="checkbox" checked={form.active} onChange={e=>update("active",e.target.checked)}/> Active for customers</label></div><div className="admin-modal-actions"><button type="button" className="admin-btn secondary" onClick={onClose}>Cancel</button><button className="admin-btn primary">{item?"Save changes":"Create offer"}</button></div></form></div>;
}

function OffersManagement() {
  const [offers,setOffers]=useState([]),[editing,setEditing]=useState(undefined),[loading,setLoading]=useState(true);
  const load=()=>client.get("/offers/manage").then(r=>setOffers(r.data.offers||[])).finally(()=>setLoading(false));
  useEffect(()=>{load().catch(()=>{});},[]);
  const save=async data=>{try{if(data._id) await client.put(`/offers/${data._id}`,data); else await client.post("/offers",data); setEditing(undefined); load();}catch(e){alert(e.response?.data?.details||e.response?.data?.error||"Could not save offer");}};
  const remove=async id=>{if(!window.confirm("Delete this offer permanently?"))return; await client.delete(`/offers/${id}`); load();};
  const toggle=async o=>{await client.put(`/offers/${o._id}`,{active:!o.active});load();};
  return <><div className="admin-toolbar"><div><b>Offers</b><small> Live database campaigns</small></div><button className="admin-btn primary" onClick={()=>setEditing(null)}>+ Create offer</button></div><section className="admin-card"><div className="admin-card-head"><div><h2>Offer Management</h2><p>Everything here is persisted in MongoDB and immediately visible on the customer Offers page.</p></div><span className="admin-count">{offers.length} offers</span></div>{loading?<p>Loading…</p>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Offer</th><th>Code</th><th>Discount</th><th>Validity</th><th>Status</th><th>Actions</th></tr></thead><tbody>{offers.map(o=><tr key={o._id}><td><b>{o.title}</b><small>{o.description}</small></td><td><strong>{o.code}</strong></td><td>{o.type==="percent"?`${o.value}%`:o.type==="fixed"?`$${o.value.toFixed(2)}`:"Free delivery"}</td><td>{o.endsAt?new Date(o.endsAt).toLocaleString():"No expiry"}</td><td><button className={`admin-status ${o.active?"on":"off"}`} onClick={()=>toggle(o)}>{o.active?"Active":"Inactive"}</button></td><td><div className="admin-actions"><button onClick={()=>setEditing(o)}>Edit</button><button className="danger" onClick={()=>remove(o._id)}>Delete</button></div></td></tr>)}</tbody></table></div>}</section>{editing!==undefined&&<OfferEditor item={editing||undefined} onClose={()=>setEditing(undefined)} onSave={save}/>}</>;
}

function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    client.get("/orders").then((res) => setOrders(res.data.orders || [])).catch(() => setOrders([])).finally(() => setLoading(false));
    socket.emit("kitchen:join");
    const add = (o) => setOrders((prev) => [o, ...prev.filter((x) => x._id !== o._id)]);
    const update = (o) => setOrders((prev) => prev.map((x) => x._id === o._id ? o : x));
    socket.on("order:new", add); socket.on("order:updated", update);
    return () => { socket.off("order:new", add); socket.off("order:updated", update); };
  }, []);
  async function advance(order) {
    const status = nextStatus(order.status); if (!status) return;
    try { const res = await client.patch(`/orders/${order._id}/status`, { status }); setOrders((all) => all.map((x) => x._id === order._id ? res.data.order : x)); } catch {}
  }
  if (loading) return <div className="admin-empty">Loading incoming orders...</div>;
  return <section className="admin-card"><div className="admin-card-head"><div><h2>Incoming orders</h2><p>Kitchen staff can receive orders and move them through preparation stages.</p></div><span className="admin-live">● Live queue</span></div><div className="admin-kanban">{COLUMNS.map((col) => { const list = orders.filter((o) => o.status === col.key); return <div className="admin-column" key={col.key}><h3>{col.label}<span>{list.length}</span></h3>{list.map((order) => <article className="admin-order" key={order._id}><div className="admin-order-top"><b>#{order._id.slice(-6).toUpperCase()}</b><span>${Number(order.total || 0).toFixed(2)}</span></div>{(order.items || []).map((i, idx) => <p key={idx}><b>{i.quantity}×</b> {i.name}</p>)}{order.deliveryAddress?.line1 && <small>📍 {order.deliveryAddress.line1}</small>}{nextStatus(order.status) && <button className="admin-btn primary full" onClick={() => advance(order)}>Move to {COLUMNS.find((x) => x.key === nextStatus(order.status)).label}</button>}</article>)}</div>; })}</div></section>;
}

function Overview({ orders, menuCount }) {
  const active = orders.filter((o) => COLUMNS.some((c) => c.key === o.status)).length;
  return <><div className="admin-metrics"><div><small>Orders today</small><strong>{orders.length}</strong><span>Incoming orders</span></div><div><small>Active kitchen queue</small><strong>{active}</strong><span>Live orders</span></div><div><small>Menu items</small><strong>{menuCount}</strong><span>Managed by staff</span></div><div><small>Restaurant status</small><strong>Open</strong><span className="green-text">● Accepting orders</span></div></div><div className="admin-card"><div className="admin-card-head"><div><h2>Kitchen control center</h2><p>Receive orders, manage dishes and keep the kitchen queue moving.</p></div></div><div className="admin-quick-grid"><Link to="/admin/orders"><span>🧾</span><b>Incoming orders</b><small>View and process new orders</small></Link><Link to="/admin/menu"><span>🍔</span><b>Food & menu</b><small>Add, modify or delete dishes</small></Link><Link to="/restaurant"><span>▦</span><b>Restaurant portal</b><small>Business settings and analytics</small></Link></div></div></>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [menuCount, setMenuCount] = useState(0);
  useEffect(() => { client.get("/menu?all=true").then(r => setMenuCount((r.data.items || []).length)).catch(() => {}); }, [location.pathname]);
  useEffect(() => { client.get("/orders").then((r) => setOrders(r.data.orders || [])).catch(() => {}); }, []);
  if (!user || !["staff", "admin"].includes(user.role)) return <div className="admin-page"><div className="admin-empty"><h2>Staff access only</h2><p>Please sign in with an administrator or kitchen staff account.</p><Link to="/login" className="admin-btn primary">Go to login</Link></div></div>;
  const section = location.pathname.split("/")[2] || "overview";
  const title = section === "menu" ? "Food & Menu" : section === "offers" ? "Offers & Deals" : section === "orders" ? "Incoming Orders" : "Kitchen Dashboard";
  return <div className="admin-page"><aside className="admin-sidebar"><Link to="/admin" className="admin-brand"><img src="/logo-mark.svg" width="28" height="28" alt="" /> QuickBite</Link><div className="admin-user"><span>KS</span><div><b>{user.name || "Kitchen Staff"}</b><small>{user.role === "admin" ? "Administrator" : "Kitchen staff"}</small></div></div><nav><Link className={section === "overview" ? "active" : ""} to="/admin">▦ Dashboard</Link><Link className={section === "orders" ? "active" : ""} to="/admin/orders">🧾 Incoming orders</Link><Link className={section === "menu" ? "active" : ""} to="/admin/menu">🍔 Food & menu</Link><Link className={section === "offers" ? "active" : ""} to="/admin/offers">🏷️ Offers</Link><Link to="/restaurant">↗ Restaurant portal</Link></nav><div className="admin-side-note"><b>● Live</b><small>Kitchen is receiving orders</small></div></aside><main className="admin-main"><header className="admin-header"><div><small>ADMIN / KITCHEN</small><h1>{title}</h1><p>Manage the restaurant menu and process customer orders from one workspace.</p></div><Link to="/restaurants" className="admin-btn secondary">View customer site</Link></header>{section === "menu" ? <MenuManagement /> : section === "offers" ? <OffersManagement /> : section === "orders" ? <OrdersManagement /> : <Overview orders={orders} menuCount={menuCount} />}</main></div>;
}
