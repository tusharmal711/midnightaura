// ReceivedDeliveries.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";

// ─── Image URL helper ─────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8008";
const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  if (img.startsWith("data:image")) return img;
  return `${BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

// ─── Status config ────────────────────────────────────────────────────────────
// orderState "SHIPPED" displayed as "Pending"
const ORDER_STATUS_STYLES = {
  SHIPPED:   { bg: "rgba(234,179,8,0.12)",  color: "#fde68a", border: "rgba(234,179,8,0.35)",  dot: "#fbbf24", label: "Pending"   },
  DELIVERED: { bg: "rgba(34,197,94,0.12)",  color: "#86efac", border: "rgba(34,197,94,0.35)",  dot: "#4ade80", label: "Delivered" },
};

const FILTERS       = ["All", "SHIPPED", "DELIVERED"];
const FILTER_LABELS = { All: "All", SHIPPED: "Pending", DELIVERED: "Delivered" };

const ORDERS_PER_PAGE = 10;

// Source badge styles
const SOURCE_STYLES = {
  delivery: { bg: "rgba(139,92,246,0.12)", color: "#c4b5fd", border: "rgba(139,92,246,0.3)", label: "Delivery" },
  cart:     { bg: "rgba(6,182,212,0.12)",  color: "#67e8f9", border: "rgba(6,182,212,0.3)",  label: "Cart"     },
};

// grid: image | orderId | customer | address | product | price | date | status | source | view
const COL = "64px minmax(110px,1fr) minmax(140px,1.2fr) minmax(180px,1.6fr) minmax(150px,1.4fr) 100px 80px 95px 68px 56px";
const TABLE_MIN_WIDTH = 1140;

// ─── Date helpers ─────────────────────────────────────────────────────────────
const toDateStr   = (d) => new Date(d).toISOString().slice(0, 10);
const todayStr     = () => toDateStr(new Date());
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateStr(d);
};

// ─── Customer key ─────────────────────────────────────────────────────────────
const customerKey = (order) =>
  order.customer?.phone ||
  order.customer?.mobileNumber ||
  order.customer?.email ||
  order.customer?.username ||
  "unknown";

const buildPendingCountMap = (orders) => {
  const map = {};
  orders.forEach((o) => {
    if (o.orderState === "SHIPPED") {
      const k = customerKey(o);
      map[k] = (map[k] || 0) + 1;
    }
  });
  return map;
};

// ─── Normalise a cart order to the same shape as a delivery order ─────────────
const normaliseCartOrder = (co) => {
  // A cart order may have multiple items — show the first as "product"
  const firstItem = (co.items || [])[0] || {};
  const itemCount = (co.items || []).length;

  return {
    orderId:         co.cartOrderId,
    orderState:      co.orderState === "CONFIRMED" ? "SHIPPED" : co.orderState, // treat CONFIRMED as pending visually
    paymentStatus:   co.paymentStatus,
    totalPrice:      co.totalPrice,
    deliveryCharge:  co.deliveryCharge,
    createdAt:       co.createdAt,
    customer:        co.customer || null,
    deliveryAddress: co.deliveryAddress || null,
    product: {
      productName:   itemCount > 1
        ? `${firstItem.productName || "—"} +${itemCount - 1} more`
        : (firstItem.productName || "—"),
      productImages: firstItem.productImage ? [firstItem.productImage] : [],
    },
    size:     firstItem.size || null,
    quantity: firstItem.quantity || null,
    _source:  "cart",
    _raw:     co,
  };
};

const normaliseDeliveryOrder = (o) => ({ ...o, _source: "delivery" });

// ─── Google Maps ──────────────────────────────────────────────────────────────
const openGoogleMaps = (lat, lng) => {
  window.open(`https://www.google.com/maps?q=${lat},${lng}&z=17&hl=en`, "_blank", "noopener,noreferrer");
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, styles }) {
  const s = styles[status];
  if (!s) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {s.dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />}
      {s.label}
    </span>
  );
}

// ─── Source Badge ─────────────────────────────────────────────────────────────
function SourceBadge({ source }) {
  const s = SOURCE_STYLES[source];
  if (!s) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: 10, fontWeight: 800,
      padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {s.label}
    </span>
  );
}

// ─── Product Thumbnail ────────────────────────────────────────────────────────
function ProductThumb({ images }) {
  const img = (images || []).filter(Boolean)[0];
  return (
    <div style={{
      width: 44, height: 56, borderRadius: 8, overflow: "hidden", flexShrink: 0,
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {img ? (
        <img src={getImageUrl(img)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      )}
    </div>
  );
}

// ─── Expandable Address ───────────────────────────────────────────────────────
function ExpandableAddress({ address }) {
  const [open, setOpen] = useState(false);
  if (!address) return <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>—</span>;

  const full = [
    address.addressLine1, address.addressLine2,
    address.city, address.state, address.pincode,
  ].filter(Boolean).join(", ");
  const short = full.length > 40 ? full.slice(0, 40) + "…" : full;
  const hasLocation = address.location?.lat && address.location?.lng;

  return (
    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
      <span>{open ? full : short}</span>
      {full.length > 40 && (
        <button
          onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
          style={{
            marginLeft: 5, fontSize: 10, fontWeight: 700, padding: "1px 6px",
            borderRadius: 6, border: "1px solid rgba(139,92,246,0.3)",
            background: "rgba(139,92,246,0.1)", color: "#a78bfa", cursor: "pointer",
          }}
        >{open ? "less" : "more"}</button>
      )}
      {hasLocation && (
        <div style={{ marginTop: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); openGoogleMaps(address.location.lat, address.location.lng); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 8, cursor: "pointer",
              background: "rgba(34,197,94,0.12)", color: "#4ade80",
              border: "1px solid rgba(34,197,94,0.3)", whiteSpace: "nowrap",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Track Location
          </button>
        </div>
      )}
      {!hasLocation && (
        <div style={{ marginTop: 5 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.2)" }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            No GPS pin
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Multi-Parcel Badge ───────────────────────────────────────────────────────
function MultiParcelBadge({ count }) {
  if (count <= 1) return null;
  return (
    <span
      title={`This customer has ${count} pending parcels — deliver all together!`}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 20,
        background: "rgba(251,191,36,0.15)", color: "#fbbf24",
        border: "1px solid rgba(251,191,36,0.35)", marginTop: 3, cursor: "default",
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2.5">
        <polyline points="21 8 21 21 3 21 3 8"/>
        <rect x="1" y="3" width="22" height="5"/>
        <line x1="10" y1="12" x2="14" y2="12"/>
      </svg>
      {count} parcels pending
    </span>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <>
      <style>{`
        @keyframes sk-del-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk-d {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.09) 50%,
            rgba(255,255,255,0.04) 75%);
          background-size: 600px 100%;
          animation: sk-del-shimmer 1.4s infinite linear;
          border-radius: 7px;
        }
      `}</style>
      <div style={{
        display: "grid", gridTemplateColumns: COL,
        padding: "12px 16px", alignItems: "center", gap: 0,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div className="sk-d" style={{ width: 44, height: 56, borderRadius: 8 }} />
        <div className="sk-d" style={{ width: 90, height: 13 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div className="sk-d" style={{ width: "70%", height: 13 }} />
          <div className="sk-d" style={{ width: "50%", height: 11 }} />
        </div>
        <div className="sk-d" style={{ width: "80%", height: 13 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <div className="sk-d" style={{ width: "75%", height: 13 }} />
          <div className="sk-d" style={{ width: "55%", height: 11 }} />
        </div>
        <div className="sk-d" style={{ width: 60, height: 13, marginLeft: "auto" }} />
        <div className="sk-d" style={{ width: 50, height: 13, margin: "0 auto" }} />
        <div className="sk-d" style={{ width: 72, height: 22, borderRadius: 20, margin: "0 auto" }} />
        <div className="sk-d" style={{ width: 52, height: 20, borderRadius: 20, margin: "0 auto" }} />
        <div className="sk-d" style={{ width: 28, height: 28, borderRadius: 9, margin: "0 auto" }} />
      </div>
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  let visible = pages;
  if (total > 7) {
    if (current <= 4)              visible = [...pages.slice(0, 5), "...", total];
    else if (current >= total - 3) visible = [1, "...", ...pages.slice(total - 5)];
    else                           visible = [1, "...", current - 1, current, current + 1, "...", total];
  }
  const btnBase = {
    minWidth: 36, height: 36, borderRadius: 9,
    border: "1px solid rgba(255,255,255,0.08)", fontSize: 13, fontWeight: 600,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s",
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "20px 0 4px", flexWrap: "wrap" }}>
      <button
        onClick={() => onChange(current - 1)} disabled={current === 1}
        style={{ ...btnBase, padding: "0 12px", background: "rgba(255,255,255,0.04)", color: current === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", cursor: current === 1 ? "not-allowed" : "pointer" }}
      >← Prev</button>
      {visible.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} style={{ color: "rgba(255,255,255,0.3)", padding: "0 4px", fontSize: 13 }}>…</span>
        ) : (
          <button
            key={p} onClick={() => onChange(p)}
            style={{
              ...btnBase,
              background: p === current ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "rgba(255,255,255,0.04)",
              color: p === current ? "#fff" : "rgba(255,255,255,0.55)",
              border: p === current ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: p === current ? "0 4px 14px rgba(109,40,217,0.35)" : "none",
            }}
          >{p}</button>
        )
      )}
      <button
        onClick={() => onChange(current + 1)} disabled={current === total}
        style={{ ...btnBase, padding: "0 12px", background: "rgba(255,255,255,0.04)", color: current === total ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)", cursor: current === total ? "not-allowed" : "pointer" }}
      >Next →</button>
    </div>
  );
}

// ─── Date Filter Bar ──────────────────────────────────────────────────────────
function DateFilterBar({ dateFilter, onDateFilter, orders }) {
  const today     = todayStr();
  const yesterday = yesterdayStr();

  const calc = (dStr) => {
    const subset    = dStr === "all" ? orders : orders.filter(o => toDateStr(o.createdAt) === dStr);
    const earned    = subset.filter(o => o.orderState === "DELIVERED").reduce((s, o) => s + (o.deliveryCharge || 0), 0);
    const shipped   = subset.filter(o => o.orderState === "SHIPPED").length;
    const delivered = subset.filter(o => o.orderState === "DELIVERED").length;
    return { count: subset.length, earned, shipped, delivered };
  };

  const quickBtns = [
    { label: "Today",     value: today     },
    { label: "Yesterday", value: yesterday },
    { label: "All Dates", value: "all"     },
  ];

  return (
    <div style={{
      borderRadius: 16, padding: "14px 16px", marginBottom: 16,
      background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)",
      display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center",
    }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {quickBtns.map(({ label, value }) => {
          const { count, earned, shipped, delivered } = calc(value);
          const isActive = dateFilter === value;
          return (
            <button
              key={value}
              onClick={() => onDateFilter(value)}
              style={{
                padding: "8px 14px", borderRadius: 12, cursor: "pointer",
                transition: "all 0.18s", textAlign: "left",
                background: isActive ? "rgba(6,182,212,0.18)" : "rgba(255,255,255,0.04)",
                border: isActive ? "1px solid rgba(6,182,212,0.45)" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 800, color: isActive ? "#67e8f9" : "rgba(255,255,255,0.5)", margin: 0 }}>{label}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>
                {count} order{count !== 1 ? "s" : ""} · ₹{earned} del. earned
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", margin: "1px 0 0" }}>
                {shipped} pending · {delivered} delivered
              </p>
            </button>
          );
        })}
      </div>

      <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(6,182,212,0.6)" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <input
          type="date"
          value={["all", today, yesterday].includes(dateFilter) ? "" : dateFilter}
          onChange={e => e.target.value && onDateFilter(e.target.value)}
          style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(6,182,212,0.2)",
            color: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "7px 10px",
            fontSize: 12, outline: "none", cursor: "pointer", colorScheme: "dark",
          }}
        />
        {!["all", today, yesterday].includes(dateFilter) && (
          <button
            onClick={() => onDateFilter("all")}
            style={{
              padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: "rgba(239,68,68,0.1)", color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer",
            }}
          >Clear</button>
        )}
      </div>

      <div style={{ marginLeft: "auto", textAlign: "right" }}>
        {(() => {
          const { count, earned, shipped, delivered } = calc(dateFilter);
          const label = dateFilter === "all" ? "All Dates" : dateFilter === today ? "Today" : dateFilter === yesterday ? "Yesterday" : dateFilter;
          return (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#67e8f9", margin: 0 }}>{label}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>
                {count} orders · ₹{earned} del. earned · {shipped} pending · {delivered} delivered
              </p>
            </>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Summary Cards ────────────────────────────────────────────────────────────
function SummaryCards({ orders, dateFilter }) {
  const subset      = dateFilter === "all" ? orders : orders.filter(o => toDateStr(o.createdAt) === dateFilter);
  const shipped     = subset.filter(o => o.orderState === "SHIPPED").length;
  const delivered   = subset.filter(o => o.orderState === "DELIVERED").length;
  const totalEarned = subset.filter(o => o.orderState === "DELIVERED").reduce((s, o) => s + (o.deliveryCharge || 0), 0);
  const cartCount   = subset.filter(o => o._source === "cart").length;
  const totalOrders = subset.length;

  const cards = [
    { label: "Total Orders",  value: totalOrders, color: "#c4b5fd", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)" },
    { label: "Pending",       value: shipped,     color: "#fde68a", bg: "rgba(234,179,8,0.1)",  border: "rgba(234,179,8,0.25)"  },
    { label: "Delivered",     value: delivered,   color: "#86efac", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)"  },
    { label: "Cart Orders",   value: cartCount,   color: "#67e8f9", bg: "rgba(6,182,212,0.1)",  border: "rgba(6,182,212,0.25)"  },
    { label: "Total Earned (Delivery Charge)", value: `₹${totalEarned}`, color: "#fbbf24", bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.25)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 20 }}>
      <style>{`
        @media(min-width:640px){ .del-summary-grid { grid-template-columns: repeat(5,1fr) !important; } }
      `}</style>
      {cards.map(({ label, value, color, bg, border }) => (
        <div key={label} className="del-summary-grid" style={{ borderRadius: 14, padding: "14px 16px", background: bg, border: `1px solid ${border}` }}>
          <p style={{ fontSize: 22, fontWeight: 800, color, margin: 0 }}>{value}</p>
          <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", margin: "3px 0 0" }}>{label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Order Row ────────────────────────────────────────────────────────────────
function DeliveryRow({ order, pendingCountMap }) {
  const navigate   = useNavigate();
  const images     = order.product?.productImages ?? [];
  const pendingCnt = order.orderState === "SHIPPED" ? (pendingCountMap[customerKey(order)] || 1) : 0;

  const handleView = () => {
    if (order._source === "cart") {
      navigate(`/delivery/dashboard/cart-deliveries/${order.orderId}`);
    } else {
      navigate(`/delivery/dashboard/deliveries/${order.orderId}`);
    }
  };

  const handleRowClick = (e) => {
    if (e.target.closest("button") || e.target.closest("input")) return;
    handleView();
  };

  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: COL,
        padding: "10px 16px", alignItems: "center", gap: 0,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer", transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(6,182,212,0.04)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      onClick={handleRowClick}
    >
      {/* Image */}
      <ProductThumb images={images} />

      {/* Order ID */}
      <span
  style={{
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: 800,
    color: order._source === "cart"
      ? "#ffb300"
      : "#a78bfa",
  }}
>
  #{order.orderId}
</span>

      {/* Customer */}
      <div style={{ minWidth: 0 }}>
        <p style={{ color: "#fff", fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {order.customer?.username || order.customer?.email?.split("@")[0] || "—"}
        </p>
        {order.customer?.customerId && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", margin: "2px 0 0" }}>
            Id: {order.customer.customerId}
          </p>
        )}
        {order.customer?.phone && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", margin: "2px 0 0" }}>
            {order.customer.phone}
          </p>
        )}
        <MultiParcelBadge count={pendingCnt} />
      </div>

      {/* Address */}
      <div style={{ paddingRight: 8 }}>
        <ExpandableAddress address={order.deliveryAddress} />
      </div>

      {/* Product */}
      <div style={{ minWidth: 0 }}>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {order.product?.productName ?? "—"}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
          {order.size && (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              Size: <span style={{ color: "#c4b5fd", fontWeight: 700 }}>{order.size.toUpperCase()}</span>
            </span>
          )}
          {order.quantity != null && (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              Qty: <span style={{ color: "#fbbf24", fontWeight: 700 }}>{order.quantity}</span>
            </span>
          )}
        </div>
      </div>

      {/* Price */}
      <div style={{ textAlign: "right" }}>
        <p style={{ color: "#fbbf24", fontWeight: 700, fontSize: 13, margin: 0 }}>₹{order.totalPrice}</p>
        {order.deliveryCharge > 0 && (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: 0 }}>+₹{order.deliveryCharge} del</p>
        )}
      </div>

      {/* Date */}
      <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 11, margin: 0, textAlign: "center", whiteSpace: "nowrap" }}>
        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
      </p>

      {/* Status */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <StatusBadge status={order.orderState} styles={ORDER_STATUS_STYLES} />
      </div>

      {/* Source */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <SourceBadge source={order._source} />
      </div>

      {/* View */}
      <div style={{ display: "flex", justifyContent: "center" }} onClick={e => e.stopPropagation()}>
        <button
          onClick={handleView}
          title="View order details"
          style={{
            padding: "6px 8px", borderRadius: 9,
            background: "rgba(6,182,212,0.1)", color: "#22d3ee",
            border: "1px solid rgba(6,182,212,0.22)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s, transform 0.12s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(6,182,212,0.22)"; e.currentTarget.style.transform = "scale(1.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(6,182,212,0.1)";  e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ReceivedDeliveries() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [active,      setActive]      = useState("All");
  const [search,      setSearch]      = useState("");
  const [dateFilter,  setDateFilter]  = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch both delivery orders & cart orders in parallel ──────────────────
  useEffect(() => {
    (async () => {
      try {
        const [deliveryRes, cartRes] = await Promise.allSettled([
          API.get("/delivery/fetchDeliveryProducts"),
          API.get("/cart/fetchAllCartOrders"),
        ]);

        const deliveryOrders =
          deliveryRes.status === "fulfilled" && deliveryRes.value.data.success
            ? deliveryRes.value.data.orders.map(normaliseDeliveryOrder)
            : [];

        const cartOrders =
          cartRes.status === "fulfilled" && cartRes.value.data.success
            ? cartRes.value.data.orders
                // Only show cart orders that have reached SHIPPED / DELIVERED stage
                .filter(o => ["SHIPPED", "DELIVERED", "CONFIRMED"].includes(o.orderState))
                .map(normaliseCartOrder)
            : [];

        // Merge & sort by createdAt desc
        const merged = [...deliveryOrders, ...cartOrders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(merged);

        if (deliveryRes.status === "rejected" && cartRes.status === "rejected") {
          setError("Failed to load delivery orders.");
        }
      } catch (err) {
        console.error("fetchOrders error", err);
        setError("Something went wrong while fetching delivery orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Pending count map ──────────────────────────────────────────────────────
  const pendingCountMap = buildPendingCountMap(orders);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = orders.filter(o => {
    const matchStatus = active === "All" || o.orderState === active;
    const matchDate   = dateFilter === "all" || toDateStr(o.createdAt) === dateFilter;
    const q           = search.toLowerCase();
    const matchSearch =
      !q ||
      o.orderId?.toLowerCase().includes(q) ||
      o.product?.productName?.toLowerCase().includes(q) ||
      o.customer?.username?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q) ||
      o.customer?.phone?.includes(q) ||
      o.customer?.customerId?.toLowerCase().includes(q) ||
      o._source?.includes(q);
    return matchStatus && matchDate && matchSearch;
  });

  useEffect(() => { setCurrentPage(1); }, [active, search, dateFilter]);

  const totalPages      = Math.max(1, Math.ceil(filtered.length / ORDERS_PER_PAGE));
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All" ? orders.length : orders.filter(o => o.orderState === f).length;
    return acc;
  }, {});

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .del-x-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .del-x-scroll::-webkit-scrollbar { height: 5px; }
        .del-x-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
        .del-x-scroll::-webkit-scrollbar-thumb { background: rgba(6,182,212,0.35); border-radius: 10px; }
        .del-x-scroll::-webkit-scrollbar-thumb:hover { background: rgba(6,182,212,0.6); }
      `}</style>

      <div>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>Received Deliveries</h1>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, margin: "4px 0 0" }}>
            {loading
              ? "Loading…"
              : `${orders.length} shipment${orders.length !== 1 ? "s" : ""} — delivery & cart orders combined`}
          </p>
        </div>

        {/* Summary cards */}
        <SummaryCards orders={orders} dateFilter={dateFilter} />

        {/* Date filter bar */}
        <DateFilterBar dateFilter={dateFilter} onDateFilter={setDateFilter} orders={orders} />

        {/* Filter tabs + search */}
        <div style={{
          borderRadius: 16, padding: "12px 14px", marginBottom: 14,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center",
        }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActive(f)}
                style={{
                  padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap",
                  ...(active === f
                    ? { background: "linear-gradient(135deg,rgba(6,182,212,0.25),rgba(6,182,212,0.12))", color: "#67e8f9", border: "1px solid rgba(6,182,212,0.4)" }
                    : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }
                  ),
                }}
              >
                {FILTER_LABELS[f]}
                {f !== "All" && <span style={{ opacity: 0.5 }}> ({counts[f]})</span>}
              </button>
            ))}
          </div>
          <div style={{ position: "relative", minWidth: 210 }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search ID, name, phone, cart…"
              style={{
                width: "100%", paddingLeft: 30, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                fontSize: 12, borderRadius: 10, outline: "none", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)", caretColor: "#67e8f9",
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div
          className="del-x-scroll"
          style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}
        >
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: COL,
            padding: "10px 16px",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.28)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)",
            gap: 0, minWidth: TABLE_MIN_WIDTH,
          }}>
            <span>Image</span>
            <span>Order ID</span>
            <span>Customer</span>
            <span>Address</span>
            <span>Product</span>
            <span style={{ textAlign: "right" }}>Price</span>
            <span style={{ textAlign: "center" }}>Date</span>
            <span style={{ textAlign: "center" }}>Status</span>
            <span style={{ textAlign: "center" }}>Source</span>
            <span style={{ textAlign: "center" }}>View</span>
          </div>

          {/* Skeleton */}
          {loading && Array.from({ length: ORDERS_PER_PAGE }).map((_, i) => (
            <div key={i} style={{ minWidth: TABLE_MIN_WIDTH }}><SkeletonRow /></div>
          ))}

          {/* Error */}
          {!loading && error && (
            <div style={{ padding: "60px 16px", textAlign: "center", color: "#fca5a5", fontSize: 13, minWidth: TABLE_MIN_WIDTH }}>
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ padding: "60px 16px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13, minWidth: TABLE_MIN_WIDTH }}>
              No delivery orders found.
            </div>
          )}

          {/* Rows */}
          {!loading && !error && paginatedOrders.map(o => (
            <div key={`${o._source}-${o.orderId}`} style={{ minWidth: TABLE_MIN_WIDTH }}>
              <DeliveryRow order={o} pendingCountMap={pendingCountMap} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.28)", marginBottom: 4 }}>
              Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}–{Math.min(currentPage * ORDERS_PER_PAGE, filtered.length)} of {filtered.length} order{filtered.length !== 1 ? "s" : ""}
            </div>
            <Pagination current={currentPage} total={totalPages} onChange={handlePageChange} />
          </div>
        )}
      </div>
    </>
  );
}