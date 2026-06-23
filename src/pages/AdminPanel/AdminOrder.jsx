// pages/admin/AdminOrder.jsx
// Shows BOTH single-product orders (Order model) and cart orders (CartOrder model)
// in a unified, tabbed view. Cart orders display a multi-item badge and expand
// to show all line-items inline.
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";
import appLogo from "../../assets/images/appImage/app-logo.png";

const BASE_URL = "https://midnightaura-1.onrender.com";
const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http") || img.startsWith("data:")) return img;
  return `${BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

const PAY_METHOD_LABEL = { COD:"Cash on Delivery", CARD:"Card", UPI:"UPI" };

const ORDER_STATUS_STYLES = {
  PLACED:    { bg:"rgba(139,92,246,0.12)", color:"#c4b5fd", border:"rgba(139,92,246,0.35)", dot:"#a78bfa" },
  CONFIRMED: { bg:"rgba(59,130,246,0.12)",  color:"#93c5fd", border:"rgba(59,130,246,0.35)",  dot:"#60a5fa" },
  SHIPPED:   { bg:"rgba(6,182,212,0.12)",   color:"#67e8f9", border:"rgba(6,182,212,0.35)",   dot:"#22d3ee" },
  DELIVERED: { bg:"rgba(34,197,94,0.12)",   color:"#86efac", border:"rgba(34,197,94,0.35)",   dot:"#4ade80" },
  RETURNED:  { bg:"rgba(34,197,94,0.12)",   color:"#86efac", border:"rgba(34,197,94,0.35)",   dot:"#4ade80" },
  CANCELLED: { bg:"rgba(239,68,68,0.12)",   color:"#fca5a5", border:"rgba(239,68,68,0.35)",   dot:"#f87171" },
};
const PAY_STATUS_STYLES = {
  PENDING: { bg:"rgba(234,179,8,0.12)", color:"#fde68a", border:"rgba(234,179,8,0.3)"  },
  PAID:    { bg:"rgba(34,197,94,0.12)", color:"#86efac", border:"rgba(34,197,94,0.3)"  },
  FAILED:  { bg:"rgba(239,68,68,0.12)", color:"#fca5a5", border:"rgba(239,68,68,0.3)"  },
};

const FILTERS       = ["All","PLACED","CONFIRMED","SHIPPED","DELIVERED","CANCELLED","RETURNED"];
const FILTER_LABELS = { All:"All", PLACED:"Placed", CONFIRMED:"Confirmed", SHIPPED:"Shipped", DELIVERED:"Delivered", RETURNED:"Returned", CANCELLED:"Cancelled" };
const ORDERS_PER_PAGE = 10;

// Grid columns: single orders show one product name; cart orders show a count pill
const COL = "70px minmax(110px,1fr) minmax(160px,1.3fr) minmax(100px,1fr) 90px 70px 95px 95px 110px 65px";
const TABLE_MIN_WIDTH = 1080;

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, styles }) {
  const s = styles[status];
  if (!s) return null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap", background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      {s.dot && <span style={{ width:6, height:6, borderRadius:"50%", background:s.dot, flexShrink:0 }}/>}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ── Image Cell ────────────────────────────────────────────────────────────────
function StackedImageCell({ images, onOpen }) {
  const valid = (images || []).filter(Boolean);
  const thumbW=40, thumbH=52, offsetX=8;
  if (!valid.length) return (
    <div style={{ width:thumbW+16, height:thumbH, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <div style={{ width:thumbW, height:thumbH, borderRadius:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      </div>
    </div>
  );
  const count   = valid.length;
  const totalW  = thumbW + (count - 1) * offsetX;
  return (
    <div style={{ position:"relative", width:totalW, height:thumbH, flexShrink:0 }}>
      {valid.map((img, i) => {
        const zIndex  = i + 1;
        const left    = i * offsetX;
        const scale   = 1 - (count - 1 - i) * 0.04;
        const opacity = 0.6 + (i / Math.max(count - 1, 1)) * 0.4;
        return (
          <div key={i} onClick={() => onOpen(images, i)} style={{ position:"absolute", left, top:0, width:thumbW, height:thumbH, borderRadius:8, overflow:"hidden", background:"rgba(255,255,255,0.06)", border: i===count-1 ? "2px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.12)", cursor:"zoom-in", zIndex, transform:`scale(${scale})`, transformOrigin:"bottom center", opacity, transition:"transform 0.15s, opacity 0.15s", boxShadow: i===count-1 ? "0 4px 12px rgba(0,0,0,0.5)" : "0 2px 6px rgba(0,0,0,0.3)" }}
            onMouseEnter={e => { e.currentTarget.style.transform="scale(1.06)"; e.currentTarget.style.opacity="1"; e.currentTarget.style.zIndex="10"; }}
            onMouseLeave={e => { e.currentTarget.style.transform=`scale(${scale})`; e.currentTarget.style.opacity=`${opacity}`; e.currentTarget.style.zIndex=`${zIndex}`; }}>
            <img src={getImageUrl(img)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", pointerEvents:"none" }}/>
          </div>
        );
      })}
    </div>
  );
}

// ── Image Lightbox ────────────────────────────────────────────────────────────
function ImageModal({ images, productName, initialIdx, onClose }) {
  const [idx, setIdx] = useState(initialIdx ?? 0);
  const [visible, setVisible] = useState(false);
  const valid = (images || []).filter(Boolean);
  const touchX = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    const onKey = (e) => {
      if (e.key === "Escape")     handleClose();
      if (e.key === "ArrowLeft")  setIdx(i => (i - 1 + valid.length) % valid.length);
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % valid.length);
    };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, []); // eslint-disable-line

  const handleClose = () => { setVisible(false); setTimeout(onClose, 240); };
  if (!valid.length) return null;

  return (
    <div onClick={handleClose} style={{ position:"fixed", inset:0, zIndex:99999, background: visible?"rgba(0,0,0,0.96)":"rgba(0,0,0,0)", backdropFilter: visible?"blur(20px)":"blur(0px)", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.24s ease, backdrop-filter 0.24s ease", cursor:"zoom-out" }}>
      <button onClick={e => { e.stopPropagation(); handleClose(); }} style={{ position:"fixed", top:18, right:18, width:46, height:46, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:100000, opacity: visible?1:0, transition:"opacity 0.2s" }}>✕</button>
      {valid.length > 1 && <>
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i-1+valid.length)%valid.length); }} style={{ position:"fixed", left:18, top:"50%", transform:"translateY(-50%)", width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:100000 }}>‹</button>
        <button onClick={e => { e.stopPropagation(); setIdx(i => (i+1)%valid.length); }} style={{ position:"fixed", right:18, top:"50%", transform:"translateY(-50%)", width:48, height:48, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", zIndex:100000 }}>›</button>
      </>}
      <div onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchX.current = e.changedTouches[0].screenX; }}
        onTouchEnd={e => { const d = touchX.current - e.changedTouches[0].screenX; if (d>50) setIdx(i=>(i+1)%valid.length); if (d<-50) setIdx(i=>(i-1+valid.length)%valid.length); }}
        style={{ position:"relative", width:"min(500px,88vw)", height:"88vh", maxWidth:"100vw", maxHeight:"100vh", borderRadius:22, overflow:"hidden", background:"#000", boxShadow:"0 60px 160px rgba(0,0,0,0.95)", transform: visible?"scale(1) translateY(0)":"scale(0.76) translateY(40px)", opacity: visible?1:0, transition:"transform 0.32s cubic-bezier(0.34,1.42,0.64,1), opacity 0.22s ease", cursor:"default" }}>
        <img src={getImageUrl(valid[idx])} alt={productName} draggable={false} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"48px 22px 22px", background:"linear-gradient(transparent,rgba(0,0,0,0.92))" }}>
          <div style={{ color:"#fff", fontWeight:700, fontSize:16 }}>{productName}</div>
          {valid.length > 1 && (
            <div style={{ display:"flex", gap:5, marginTop:10, justifyContent:"center" }}>
              {valid.map((_,i) => <button key={i} onClick={() => setIdx(i)} style={{ width:i===idx?22:6, height:6, borderRadius:3, background: i===idx?"#a78bfa":"rgba(255,255,255,0.4)", border:"none", cursor:"pointer", padding:0, transition:"width 0.2s" }}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Cancel Modal ──────────────────────────────────────────────────────────────
const CANCEL_REASONS = ["Out of stock","Customer requested cancellation","Payment issue","Duplicate order","Other"];
function CancelModal({ order, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const name = order.isCartOrder
    ? `Cart Order (${order.items?.length || 0} items)`
    : (order.product?.productName || "—");
  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:16, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(8px)" }}>
      <div style={{ borderRadius:20, padding:24, width:"100%", maxWidth:360, background:"#0f0f14", border:"1px solid rgba(239,68,68,0.2)" }}>
        <h3 style={{ color:"#fff", fontSize:15, fontWeight:700, margin:"0 0 4px" }}>Cancel Order</h3>
        <p style={{ color:"rgba(255,255,255,0.4)", fontSize:12, margin:"0 0 16px" }}>#{order.orderId || order.cartOrderId} · {name}</p>
        <label style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", display:"block", marginBottom:6 }}>Reason</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} style={{ width:"100%", borderRadius:12, padding:"9px 12px", fontSize:13, marginBottom:18, outline:"none", boxSizing:"border-box", background:"#07070A", border:"1px solid rgba(255,255,255,0.1)", color:"#fff" }}>
          {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:"10px", borderRadius:12, fontSize:13, fontWeight:600, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.08)", cursor:"pointer" }}>Back</button>
          <button onClick={() => onConfirm(reason)} disabled={loading} style={{ flex:1, padding:"10px", borderRadius:12, fontSize:13, fontWeight:600, background:"rgba(239,68,68,0.18)", color:"#fca5a5", border:"1px solid rgba(239,68,68,0.3)", cursor: loading?"not-allowed":"pointer", opacity: loading?0.7:1 }}>
            {loading ? "Cancelling…" : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cart Items Expand Panel ───────────────────────────────────────────────────
function CartItemsPanel({ items }) {
  return (
    <div style={{ gridColumn:"1 / -1", background:"rgba(160,120,255,0.04)", borderTop:"1px solid rgba(160,120,255,0.1)", padding:"12px 16px" }}>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ width:36, height:44, borderRadius:8, overflow:"hidden", flexShrink:0, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
              {item.productImage
                ? <img src={getImageUrl(item.productImage)} alt={item.productName} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,0.15)", fontSize:8 }}>N/A</div>
              }
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#e8e0ff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.productName || "—"}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:1 }}>
                {item.size && <span style={{ marginRight:8 }}>Size: <span style={{ color:"#a078ff" }}>{item.size}</span></span>}
                Qty: <span style={{ color:"#fbbf24" }}>{item.quantity}</span>
                {item.discount > 0 && <span style={{ marginLeft:8, color:"#4ade80" }}>{item.discount}% off</span>}
              </div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#17ec03" }}>₹{fmt(item.lineTotal)}</div>
              {item.discount > 0 && <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textDecoration:"line-through" }}>₹{fmt(item.mrp * item.quantity)}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:COL, width:"100%", padding:"12px 16px", alignItems:"center", gap:0, borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ display:"flex", gap:4 }}>
        {[0,1,2].map(i => <div key={i} style={{ width:40, height:52, borderRadius:8, background:"rgba(255,255,255,0.06)", flexShrink:0, animation:"sk-sh 1.4s infinite linear", opacity:1-i*0.2 }}/>)}
      </div>
      {[90,80,70,48,36,68,72,90,28].map((w,i) => <div key={i} style={{ width:w, height: i===5||i===6?22:13, borderRadius: i===5||i===6?20:6, background:"rgba(255,255,255,0.06)", animation:"sk-sh 1.4s infinite linear", margin:i===3?"0 0 0 auto":i===4||i===5||i===6||i===8?"0 auto":"0" }}/>)}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = []; for (let i=1;i<=total;i++) pages.push(i);
  let visible = pages;
  if (total > 7) {
    if (current <= 4) visible = [...pages.slice(0,5),"...",total];
    else if (current >= total-3) visible = [1,"...",...pages.slice(total-5)];
    else visible = [1,"...",current-1,current,current+1,"...",total];
  }
  const base = { minWidth:36, height:36, borderRadius:9, border:"1px solid rgba(255,255,255,0.08)", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" };
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"20px 0 4px", flexWrap:"wrap" }}>
      <button onClick={() => onChange(current-1)} disabled={current===1} style={{ ...base, padding:"0 12px", background:"rgba(255,255,255,0.04)", color: current===1?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.6)", cursor: current===1?"not-allowed":"pointer" }}>← Prev</button>
      {visible.map((p,i) => p==="..." ? <span key={`e${i}`} style={{ color:"rgba(255,255,255,0.3)", padding:"0 4px", fontSize:13 }}>…</span> : (
        <button key={p} onClick={() => onChange(p)} style={{ ...base, background: p===current?"linear-gradient(135deg,#7c3aed,#6d28d9)":"rgba(255,255,255,0.04)", color: p===current?"#fff":"rgba(255,255,255,0.55)", border: p===current?"1px solid rgba(139,92,246,0.5)":"1px solid rgba(255,255,255,0.08)", boxShadow: p===current?"0 4px 14px rgba(109,40,217,0.35)":"none" }}>{p}</button>
      ))}
      <button onClick={() => onChange(current+1)} disabled={current===total} style={{ ...base, padding:"0 12px", background:"rgba(255,255,255,0.04)", color: current===total?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.6)", cursor: current===total?"not-allowed":"pointer" }}>Next →</button>
    </div>
  );
}

// ── Order Row (unified for both types) ───────────────────────────────────────
function OrderRow({ order, onImageClick, onAccept, onCancelRequest, acceptLoad }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const isCart = order.isCartOrder;

  // Images: for cart orders combine all item images; for single orders use product images
  const images = isCart
    ? (order.items || []).map((i) => i.productImage).filter(Boolean)
    : (order.product?.productImages ?? []);

  const productCell = isCart ? (
    <div style={{ minWidth:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
        <span style={{ fontSize:13, fontWeight:600, color:"#e8e0ff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Cart Order</span>
        <span style={{ fontSize:10, fontWeight:700, background:"rgba(160,120,255,0.15)", color:"#a078ff", border:"1px solid rgba(160,120,255,0.35)", padding:"1px 7px", borderRadius:999 }}>{order.items?.length} items</span>
      </div>
      <button onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
        style={{ marginTop:3, fontSize:10, color:"#a078ff", background:"none", border:"none", cursor:"pointer", padding:0, display:"flex", alignItems:"center", gap:3 }}>
        {expanded ? "▲ Hide items" : "▼ Show items"}
      </button>
    </div>
  ) : (
    <div style={{ minWidth:0 }}>
      <p style={{ color:"#fff", fontSize:13, fontWeight:600, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{order.product?.productName ?? "—"}</p>
      <div style={{ display:"flex", gap:8, marginTop:3 }}>
        {order.size && <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Size: <span style={{ color:"#c4b5fd", fontWeight:600 }}>{order.size.toUpperCase()}</span></span>}
        {order.quantity != null && <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Qty: <span style={{ color:"#fbbf24", fontWeight:600 }}>{order.quantity}</span></span>}
      </div>
    </div>
  );

  const idField  = isCart ? order.cartOrderId : order.orderId;
  const idColor  = isCart ? "#f59e0b" : "#a78bfa";

  const renderActions = () => {
    switch (order.orderState) {
      case "PLACED":
        return (
          <>
            <button onClick={() => onAccept(order)} disabled={!!acceptLoad} style={{ padding:"5px 10px", borderRadius:9, fontSize:11, fontWeight:700, background:"rgba(34,197,94,0.15)", color:"#86efac", border:"1px solid rgba(34,197,94,0.3)", cursor:acceptLoad?"not-allowed":"pointer", opacity:acceptLoad?0.6:1, whiteSpace:"nowrap" }}>
              {acceptLoad===idField ? "…" : "Accept"}
            </button>
            <button onClick={() => onCancelRequest(order)} style={{ padding:"5px 10px", borderRadius:9, fontSize:11, fontWeight:700, background:"rgba(239,68,68,0.12)", color:"#fca5a5", border:"1px solid rgba(239,68,68,0.25)", cursor:"pointer", whiteSpace:"nowrap" }}>Cancel</button>
          </>
        );
      case "CONFIRMED":
        return <button onClick={() => onCancelRequest(order)} style={{ padding:"5px 10px", borderRadius:9, fontSize:11, fontWeight:700, background:"rgba(239,68,68,0.12)", color:"#fca5a5", border:"1px solid rgba(239,68,68,0.25)", cursor:"pointer", whiteSpace:"nowrap" }}>Cancel</button>;
      default:
        return <span style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>—</span>;
    }
  };

  const viewPath = isCart ? `/admin/cart-orders/${idField}` : `/admin/orders/${idField}`;

  return (
    <>
      <div style={{ display:"grid", gridTemplateColumns:COL, width:"100%", padding:"10px 16px", alignItems:"center", gap:0, borderBottom: expanded ? "none" : "1px solid rgba(255,255,255,0.05)", cursor:"pointer", transition:"background 0.15s" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.05)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        onClick={(e) => { if (e.target.closest("button") || e.target.closest("select")) return; navigate(viewPath); }}>

        {/* Images */}
        <div onClick={e => e.stopPropagation()}>
          <StackedImageCell images={images} onOpen={(imgs,idx) => onImageClick({ images:imgs, productName: isCart?"Cart Items":order.product?.productName, initialIdx:idx })}/>
        </div>

        {/* Order ID */}
        <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color:idColor }}>
          #{idField}
          {isCart && <span style={{ display:"block", fontSize:9, color:"rgba(255,255,255,0.3)", fontWeight:400, fontFamily:"sans-serif", marginTop:1 }}>CART ORDER</span>}
        </span>

        {/* Product / Cart label */}
        {productCell}

        {/* Customer */}
        <p style={{ color:"rgba(255,255,255,0.72)", fontSize:13, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {order.customer?.username || order.customer?.email?.split("@")[0] || "—"}
        </p>

        {/* Amount */}
        <div style={{ textAlign:"right" }}>
          <p style={{ color:"#fbbf24", fontWeight:700, fontSize:13, margin:0 }}>₹{fmt(order.totalPrice)}</p>
          {order.deliveryCharge > 0 && <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, margin:0 }}>+₹{fmt(order.deliveryCharge)} del</p>}
        </div>

        {/* Date */}
        <p style={{ color:"rgba(255,255,255,0.38)", fontSize:11, margin:0, textAlign:"center", whiteSpace:"nowrap" }}>
          {new Date(order.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"2-digit" })}
        </p>

        {/* Payment status */}
        <div style={{ display:"flex", justifyContent:"center" }}><StatusBadge status={order.paymentStatus} styles={PAY_STATUS_STYLES}/></div>

        {/* Order state */}
        <div style={{ display:"flex", justifyContent:"center" }}><StatusBadge status={order.orderState} styles={ORDER_STATUS_STYLES}/></div>

        {/* Actions */}
        <div style={{ display:"flex", gap:6, justifyContent:"center", alignItems:"center" }} onClick={e => e.stopPropagation()}>
          {renderActions()}
        </div>

        {/* View */}
        <div style={{ display:"flex", justifyContent:"center" }} onClick={e => e.stopPropagation()}>
          <button onClick={() => navigate(viewPath)} title="View order details" style={{ padding:"6px 8px", borderRadius:9, background:"rgba(34,197,94,0.1)", color:"#4ade80", border:"1px solid rgba(34,197,94,0.22)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s, transform 0.12s" }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(34,197,94,0.22)"; e.currentTarget.style.transform="scale(1.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(34,197,94,0.1)"; e.currentTarget.style.transform="scale(1)"; }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>

      {/* Cart items expand */}
      {isCart && expanded && (
        <div style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <CartItemsPanel items={order.items || []}/>
        </div>
      )}
    </>
  );
}

// ── Print Bills ───────────────────────────────────────────────────────────────
function printAllBills(orders) {
  if (!orders || orders.length === 0) return;

  const billPages = orders.map((order) => {
    const isCart = order.isCartOrder;
    const { customer, deliveryAddress } = order;

    const addrParts = [deliveryAddress?.addressLine1, deliveryAddress?.addressLine2, deliveryAddress?.city, deliveryAddress?.district, deliveryAddress?.state, deliveryAddress?.pincode, deliveryAddress?.country].filter(Boolean);
    const total     = Number(order.totalPrice || 0);
    const delivery  = Number(order.deliveryCharge || 0);
    const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";
    const payMethod = PAY_METHOD_LABEL[order.payMethod] || order.payMethod || "—";
    const orderId   = order.cartOrderId || order.orderId;

    const itemRows = isCart
      ? (order.items || []).map((item) => `
          <tr>
            <td>${item.productName || "—"}${item.size ? ` (Size: ${item.size})` : ""}</td>
            <td class="right">${item.quantity}</td>
            <td class="right">₹${fmt(item.unitPrice)}</td>
            <td class="right">₹${fmt(item.lineTotal)}</td>
          </tr>`).join("")
      : `<tr>
            <td>${order.product?.productName || "—"}${order.size ? ` (Size: ${order.size})` : ""}</td>
            <td class="right">${order.quantity}</td>
            <td class="right">₹${fmt(order.productPrice)}</td>
            <td class="right">₹${fmt(Number(order.productPrice) * Number(order.quantity))}</td>
          </tr>`;

    return `
<div class="bill-page">
  <div class="header">
    <div class="brand"><img src="${appLogo}"/><div><div class="brand-name">MIDNIGHT AURA</div><div class="brand-sub">PREMIUM FASHION</div></div></div>
    <div class="order-side">
      <div class="order-info"><div class="order-label">ORDER ID</div><div class="order-id">#${orderId}</div><div class="order-date">${orderDate}</div>${isCart?`<div style="margin-top:6px;font-size:12px;color:#7c3aed;font-weight:700">CART ORDER · ${order.items?.length} items</div>`:""}</div>
      <div id="qr-${orderId}" class="qr-box" data-qr="${encodeURIComponent(JSON.stringify({ orderId, orderState:order.orderState, customer:{ name:customer?.username, phone:customer?.phone }, total }))}"></div>
    </div>
  </div>
  <div class="line"></div>
  <div class="info-grid">
    <div><div class="section-title">CUSTOMER</div><div class="info-text"><b>${customer?.username||""}</b><br>ID: ${customer?.customerId||""}<br>${customer?.email||""}<br>${customer?.phone||""}</div></div>
    <div><div class="section-title">DELIVERY ADDRESS</div><div class="info-text">${addrParts.join(", ")||"—"}</div></div>
  </div>
  <div class="line"></div>
  <div class="info-strip">
    <div><div class="strip-title">ORDER DATE</div><div class="strip-value">${orderDate}</div></div>
    <div><div class="strip-title">PAYMENT METHOD</div><div class="strip-value">${payMethod}</div></div>
    <div><div class="strip-title">ORDER TYPE</div><div class="strip-value">${isCart?"Cart Order":"Single Product"}</div></div>
  </div>
  <div class="line"></div>
  <table class="table">
    <tr><th>DESCRIPTION</th><th class="right">QTY</th><th class="right">UNIT PRICE</th><th class="right">AMOUNT</th></tr>
    ${itemRows}
    ${order.voucherDiscount > 0 ? `<tr><td>Voucher Discount</td><td></td><td></td><td class="right">− ₹${fmt(order.voucherDiscount)}</td></tr>` : ""}
    <tr><td>Delivery Charges</td><td></td><td></td><td class="right">${delivery===0?"FREE":"₹"+fmt(delivery)}</td></tr>
    <tr class="total-row"><td>TOTAL AMOUNT PAYABLE</td><td></td><td></td><td class="right">₹${fmt(total)}</td></tr>
  </table>
  <div class="barcode-section">
    <svg id="bc-${orderId}" class="barcode-svg" data-barcode="SHIP:${orderId}"></svg>
    <div class="barcode-id">SHIP:${orderId}</div>
  </div>
  <div class="line" style="border-style:dashed"></div>
  <div class="footer"><h3>Thank you for shopping with us! ✨</h3><p>This is a computer-generated invoice.<br>No signature required.</p></div>
</div>`;
  });

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoices — Midnight Aura</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;background:#fff;color:#111}
.bill-page{width:900px;margin:auto;padding:30px;background:#fff;page-break-after:always}
.bill-page:last-child{page-break-after:avoid}
.line{border-top:1px solid #d7d7d7;margin:25px 0}
.header{display:flex;justify-content:space-between;align-items:flex-start}
.brand{display:flex;align-items:center;gap:14px}.brand img{width:60px;height:60px}
.brand-name{font-size:34px;font-weight:700;letter-spacing:1px}.brand-sub{font-size:13px;letter-spacing:6px;color:#777;margin-top:6px}
.order-side{display:flex;align-items:flex-start;gap:25px}.order-info{text-align:right}
.order-label{font-size:14px;color:#555;margin-bottom:8px}.order-id{font-size:28px;font-weight:700}
.order-date{margin-top:8px;color:#444;font-size:14px}.qr-box{width:110px;height:110px;flex-shrink:0}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
.section-title{font-size:14px;font-weight:700;margin-bottom:18px}.info-text{font-size:15px;line-height:2;color:#222}
.info-strip{display:grid;grid-template-columns:1fr 1fr 1fr;gap:30px}
.strip-title{font-size:14px;font-weight:700;margin-bottom:14px}.strip-value{font-size:15px;line-height:1.8}
.table{width:100%;border-collapse:collapse}
.table th{text-align:left;padding:14px 10px;border-bottom:1px solid #ccc;font-size:14px}
.table td{padding:18px 10px;border-bottom:1px solid #eee;font-size:15px}.right{text-align:right}
.total-row td{font-weight:700;font-size:18px}
.barcode-section{text-align:center;margin-top:25px}.barcode-svg{width:230px;height:45px}.barcode-id{margin-top:8px;font-size:14px}
.footer{text-align:center;margin-top:35px}.footer h3{font-size:18px;margin-bottom:10px}.footer p{color:#444;line-height:1.8}
@media print{.bill-page{page-break-after:always}.bill-page:last-child{page-break-after:avoid}}</style>
</head><body>${billPages.join("\n")}
<script>(function(){
  document.querySelectorAll('.qr-box[data-qr]').forEach(function(el){ try{ new QRCode(el,{text:decodeURIComponent(el.getAttribute('data-qr')),width:110,height:110}); }catch(e){} });
  document.querySelectorAll('[data-barcode]').forEach(function(el){ try{ JsBarcode(el,el.getAttribute('data-barcode'),{format:'CODE128',width:1.5,height:40,displayValue:false}); }catch(e){} });
  setTimeout(function(){ window.print(); },800);
})();<\/script></body></html>`;

  const win = window.open("","_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AdminOrder() {
  const [orders,      setOrders]      = useState([]);   // unified (single + cart)
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [active,      setActive]      = useState("All");
  const [orderType,   setOrderType]   = useState("All");  // "All" | "Single" | "Cart"
  const [search,      setSearch]      = useState("");
  const [lightbox,    setLightbox]    = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelLoad,  setCancelLoad]  = useState(false);
  const [acceptLoad,  setAcceptLoad]  = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch both order types ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [singleRes, cartRes] = await Promise.all([
          API.get("/product/fetchOrders"),
          API.get("/cart/fetchAllCartOrders"),
        ]);

        const singles = (singleRes.data.success ? singleRes.data.orders : []).map((o) => ({ ...o, isCartOrder:false }));
        const carts   = (cartRes.data.success   ? cartRes.data.orders   : []).map((o) => ({ ...o, isCartOrder:true  }));

        // Merge & sort by createdAt desc
        const merged = [...singles, ...carts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(merged);
      } catch (err) {
        console.error("fetchOrders error:", err);
        setError("Something went wrong while fetching orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Accept ────────────────────────────────────────────────────────────────
  const handleAccept = useCallback(async (order) => {
    const isCart   = order.isCartOrder;
    const idField  = isCart ? order.cartOrderId : order.orderId;
    const nextState = order.orderState === "PLACED" ? "CONFIRMED" : order.orderState === "CONFIRMED" ? "SHIPPED" : "DELIVERED";
    const url       = isCart ? `/cart/updateCartOrderStatus/${idField}` : `/productBuy/updateOrderStatus/${idField}`;
    setAcceptLoad(idField);
    try {
      const res = await API.put(url, { orderState:nextState });
      if (res.data.success) {
        setOrders((prev) => prev.map((o) => {
          const oid = o.isCartOrder ? o.cartOrderId : o.orderId;
          return oid === idField ? { ...o, orderState:nextState } : o;
        }));
      }
    } catch (err) { console.error("acceptOrder error:", err); }
    finally { setAcceptLoad(null); }
  }, []);

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancelConfirm = useCallback(async (reason) => {
    if (!cancelOrder) return;
    const isCart  = cancelOrder.isCartOrder;
    const idField = isCart ? cancelOrder.cartOrderId : cancelOrder.orderId;
    const url     = isCart ? `/cart/updateCartOrderStatus/${idField}` : `/productBuy/updateOrderStatus/${idField}`;
    setCancelLoad(true);
    try {
      const res = await API.put(url, { orderState:"CANCELLED", reason });
      if (res.data.success) {
        setOrders((prev) => prev.map((o) => {
          const oid = o.isCartOrder ? o.cartOrderId : o.orderId;
          return oid === idField ? { ...o, orderState:"CANCELLED", cancellationReason:reason } : o;
        }));
        setCancelOrder(null);
      }
    } catch (err) { console.error("cancelOrder error:", err); }
    finally { setCancelLoad(false); }
  }, [cancelOrder]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = orders.filter((o) => {
    if (active !== "All" && o.orderState !== active) return false;
    if (orderType === "Single" && o.isCartOrder)  return false;
    if (orderType === "Cart"   && !o.isCartOrder) return false;
    const q = search.toLowerCase();
    if (!q) return true;
    const idField = o.isCartOrder ? o.cartOrderId : o.orderId;
    const name    = o.isCartOrder
      ? (o.items || []).map((i) => i.productName).join(" ")
      : (o.product?.productName || "");
    return (
      idField?.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      o.customer?.username?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q)
    );
  });

  useEffect(() => { setCurrentPage(1); }, [active, search, orderType]);

  const totalPages      = Math.max(1, Math.ceil(filtered.length / ORDERS_PER_PAGE));
  const paginatedOrders = filtered.slice((currentPage-1)*ORDERS_PER_PAGE, currentPage*ORDERS_PER_PAGE);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All" ? orders.length : orders.filter((o) => o.orderState === f).length;
    return acc;
  }, {});

  const SUMMARY = [
    { key:"PLACED",    label:"Placed"    },
    { key:"CONFIRMED", label:"Confirmed" },
    { key:"SHIPPED",   label:"Shipped"   },
    { key:"DELIVERED", label:"Delivered" },
    { key:"RETURNED",  label:"Returned"  },
    { key:"CANCELLED", label:"Cancelled" },
  ];

  const showPrintBills = active === "CONFIRMED";

  return (
    <>
      <style>{`
        .order-x-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
        .order-x-scroll::-webkit-scrollbar{height:5px}
        .order-x-scroll::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.35);border-radius:10px}
        @keyframes sk-sh{0%{background-position:-600px 0}100%{background-position:600px 0}}
      `}</style>

      <div>
        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <h1 style={{ color:"#fff", fontSize:22, fontWeight:800, margin:0 }}>Orders</h1>
          <p style={{ color:"rgba(255,255,255,0.38)", fontSize:13, margin:"4px 0 0" }}>
            {loading ? "Loading…" : `${orders.length} total · ${orders.filter(o=>o.isCartOrder).length} cart · ${orders.filter(o=>!o.isCartOrder).length} single`}
          </p>
        </div>

        {/* Summary cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, marginBottom:20 }}>
          <style>{`@media(min-width:640px){.ord-sum-grid{grid-template-columns:repeat(6,1fr)!important}}`}</style>
          {SUMMARY.map(({ key, label }) => {
            const st = ORDER_STATUS_STYLES[key];
            return (
              <button key={key} className="ord-sum-grid" onClick={() => setActive(key)} style={{ borderRadius:14, padding:"12px 14px", display:"flex", alignItems:"center", gap:12, textAlign:"left", cursor:"pointer", background: active===key?st.bg:"rgba(255,255,255,0.04)", border: active===key?`1px solid ${st.border}`:"1px solid rgba(255,255,255,0.08)", transition:"all 0.18s" }}>
                <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:st.bg, border:`1px solid ${st.border}` }}>
                  <span style={{ fontSize:13, fontWeight:800, color:st.color }}>{counts[key]}</span>
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:700, color:st.color, margin:0 }}>{label}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>orders</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters row */}
        <div style={{ borderRadius:16, padding:"12px 14px", marginBottom:14, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", flexWrap:"wrap", gap:10, alignItems:"center" }}>

          {/* Status filter tabs */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", flex:1 }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActive(f)} style={{ padding:"6px 12px", borderRadius:10, fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", ...(active===f ? { background:"linear-gradient(135deg,rgba(139,92,246,0.28),rgba(124,58,237,0.18))", color:"#c4b5fd", border:"1px solid rgba(139,92,246,0.4)" } : { background:"rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.45)", border:"1px solid rgba(255,255,255,0.08)" }) }}>
                {FILTER_LABELS[f]}{f!=="All" && <span style={{ opacity:0.5 }}> ({counts[f]})</span>}
              </button>
            ))}
          </div>

          {/* Order type tabs */}
          <div style={{ display:"flex", gap:6 }}>
            {["All","Single","Cart"].map((t) => (
              <button key={t} onClick={() => setOrderType(t)} style={{ padding:"6px 12px", borderRadius:10, fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", ...(orderType===t ? { background:"rgba(251,191,36,0.15)", color:"#fbbf24", border:"1px solid rgba(251,191,36,0.4)" } : { background:"rgba(255,255,255,0.04)", color:"rgba(255,255,255,0.4)", border:"1px solid rgba(255,255,255,0.08)" }) }}>
                {t==="All"?"All Types":t==="Cart"?"Cart Orders":"Single Orders"}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position:"relative", minWidth:200 }}>
            <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders, customers…" style={{ width:"100%", paddingLeft:30, paddingRight:14, paddingTop:8, paddingBottom:8, fontSize:12, borderRadius:10, outline:"none", boxSizing:"border-box", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.8)" }}/>
          </div>

          {/* Print Bills (CONFIRMED filter only) */}
          {showPrintBills && (
            <button onClick={() => { if(filtered.length>0) printAllBills(filtered); }} disabled={loading||filtered.length===0}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 16px", borderRadius:10, background: loading||filtered.length===0?"rgba(255,255,255,0.04)":"rgba(6,182,212,0.15)", color: loading||filtered.length===0?"rgba(255,255,255,0.25)":"#67e8f9", border: loading||filtered.length===0?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(6,182,212,0.35)", cursor: loading||filtered.length===0?"not-allowed":"pointer", fontSize:12, fontWeight:700, whiteSpace:"nowrap" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
              Print Bills {!loading && filtered.length > 0 && <span style={{ background:"rgba(6,182,212,0.25)", color:"#67e8f9", borderRadius:6, padding:"1px 6px", fontSize:10, fontWeight:800, border:"1px solid rgba(6,182,212,0.35)" }}>{filtered.length}</span>}
            </button>
          )}
        </div>

        {/* Table */}
        <div className="order-x-scroll" style={{ borderRadius:16, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)" }}>
          {/* Header row */}
          <div style={{ display:"grid", gridTemplateColumns:COL, width:"100%", padding:"10px 16px", fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.28)", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.02)", gap:0 }}>
            <span>Images</span><span>Order ID</span><span>Product</span><span>Customer</span>
            <span style={{ textAlign:"right" }}>Amount</span><span style={{ textAlign:"center" }}>Date</span>
            <span style={{ textAlign:"center" }}>Payment</span><span style={{ textAlign:"center" }}>Status</span>
            <span style={{ textAlign:"center" }}>Actions</span><span style={{ textAlign:"center" }}>View</span>
          </div>

          {loading && Array.from({ length:ORDERS_PER_PAGE }).map((_,i) => <SkeletonRow key={i}/>)}
          {!loading && error && <div style={{ padding:"60px 16px", textAlign:"center", color:"#fca5a5", fontSize:13, minWidth:TABLE_MIN_WIDTH }}>{error}</div>}
          {!loading && !error && filtered.length===0 && <div style={{ padding:"60px 16px", textAlign:"center", color:"rgba(255,255,255,0.3)", fontSize:13, minWidth:TABLE_MIN_WIDTH }}>No orders found.</div>}
          {!loading && !error && paginatedOrders.map((o) => {
            const key = o.isCartOrder ? o.cartOrderId : o.orderId;
            return <OrderRow key={key} order={o} onImageClick={setLightbox} onAccept={handleAccept} onCancelRequest={setCancelOrder} acceptLoad={acceptLoad}/>;
          })}
        </div>

        {/* Pagination */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ marginTop:4 }}>
            <div style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.28)", marginBottom:4 }}>
              Showing {(currentPage-1)*ORDERS_PER_PAGE+1}–{Math.min(currentPage*ORDERS_PER_PAGE,filtered.length)} of {filtered.length} order{filtered.length!==1?"s":""}
            </div>
            <Pagination current={currentPage} total={totalPages} onChange={(p) => { setCurrentPage(p); window.scrollTo({ top:0, behavior:"smooth" }); }}/>
          </div>
        )}

        {/* Modals */}
        {lightbox && <ImageModal images={lightbox.images} productName={lightbox.productName} initialIdx={lightbox.initialIdx} onClose={() => setLightbox(null)}/>}
        {cancelOrder && <CancelModal order={cancelOrder} onConfirm={handleCancelConfirm} onClose={() => setCancelOrder(null)} loading={cancelLoad}/>}
      </div>
    </>
  );
}