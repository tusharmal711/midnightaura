// Order.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";
import appLogo from "../../assets/images/appImage/app-logo.png";

// ─── Image URL helper ─────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8008";
const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  if (img.startsWith("data:image")) return img;
  return `${BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

const PAY_METHOD_LABEL = {
  COD: "Cash on Delivery",
  CARD: "Card",
  UPI: "UPI",
};

// ─── Status config ────────────────────────────────────────────────────────────
const ORDER_STATUS_STYLES = {
  PLACED:    { bg: "rgba(139,92,246,0.12)", color: "#c4b5fd", border: "rgba(139,92,246,0.35)", dot: "#a78bfa" },
  CONFIRMED: { bg: "rgba(59,130,246,0.12)", color: "#93c5fd", border: "rgba(59,130,246,0.35)", dot: "#60a5fa" },
  SHIPPED:   { bg: "rgba(6,182,212,0.12)",  color: "#67e8f9", border: "rgba(6,182,212,0.35)",  dot: "#22d3ee" },
  DELIVERED: { bg: "rgba(34,197,94,0.12)",  color: "#86efac", border: "rgba(34,197,94,0.35)",  dot: "#4ade80" },
  RETURNED: { bg: "rgba(34,197,94,0.12)",  color: "#86efac", border: "rgba(34,197,94,0.35)",  dot: "#4ade80" },
  CANCELLED: { bg: "rgba(239,68,68,0.12)",  color: "#fca5a5", border: "rgba(239,68,68,0.35)",  dot: "#f87171" },
};

const PAY_STATUS_STYLES = {
  PENDING: { bg: "rgba(234,179,8,0.12)", color: "#fde68a", border: "rgba(234,179,8,0.3)"  },
  PAID:    { bg: "rgba(34,197,94,0.12)", color: "#86efac", border: "rgba(34,197,94,0.3)"  },
  FAILED:  { bg: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "rgba(239,68,68,0.3)"  },
};

const FILTERS = ["All", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED","RETURNED"];
const FILTER_LABELS = {
  All: "All", PLACED: "Placed", CONFIRMED: "Confirmed",
  SHIPPED: "Shipped", DELIVERED: "Delivered", RETURNED : "Returned",CANCELLED: "Cancelled",
};

// ─── Pagination config ────────────────────────────────────────────────────────
const ORDERS_PER_PAGE = 10;

// ─── Column layout ────────────────────────────────────────────────────────────
const COL =
  "70px minmax(120px,1fr) minmax(170px,1.4fr) minmax(120px,1fr) 90px 70px 95px 95px 100px 65px";

const TABLE_MIN_WIDTH = 1080;

// ─── Print Bills (all filtered orders, one per page) ─────────────────────────
function printAllBills(orders) {
  if (!orders || orders.length === 0) return;

  const billPages = orders.map((order) => {
    const { product, customer, deliveryAddress } = order;

    const addrParts = [
      deliveryAddress?.addressLine1,
      deliveryAddress?.addressLine2,
      deliveryAddress?.city,
      deliveryAddress?.district,
      deliveryAddress?.state,
      deliveryAddress?.pincode,
      deliveryAddress?.country,
    ].filter(Boolean);

    const price      = Number(product?.price || 0);
    const discount   = Number(product?.discount || 0);
    const finalPrice = Number(product?.finalPrice || price);
    const qty        = Number(order.quantity || 1);
    const delivery   = Number(order.deliveryCharge || 0);
    const total      = Number(order.totalPrice || (finalPrice * qty + delivery));

    const payMethodDisplay =
      PAY_METHOD_LABEL[order.payMethod] || order.payMethod || order.paymentMode || "—";

    const orderDateFormatted = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
        })
      : "—";

    const qrData = JSON.stringify({
      orderId:    order.orderId,
      orderState: order.orderState,
      customer:   { name: customer?.username, phone: customer?.phone },
      product:    { name: product?.productName, size: order.size, quantity: order.quantity },
      total,
    });

    const barcodeData = `SHIP:${order.orderId}`;

    // Safely escape single quotes for data attribute
    const safeQrData = qrData.replace(/'/g, "&#39;");

    return `
<div class="bill-page">

  <div class="header">
    <div class="brand">
      <img src="${appLogo}" />
      <div>
        <div class="brand-name">MIDNIGHT AURA</div>
        <div class="brand-sub">PREMIUM FASHION</div>
      </div>
    </div>
    <div class="order-side">
      <div class="order-info">
        <div class="order-label">ORDER ID</div>
        <div class="order-id">#${order.orderId}</div>
        <div class="order-date">${orderDateFormatted}</div>
      </div>
      <div
        id="qr-${order.orderId}"
        class="qr-box"
        data-qr="${encodeURIComponent(safeQrData)}"
      ></div>
    </div>
  </div>

  <div class="line"></div>

  <div class="info-grid">
    <div>
      <div class="section-title">CUSTOMER</div>
      <div class="info-text">
        <b>${customer?.username || ""}</b><br>
        ID: ${customer?.customerId || ""}<br>
        ${customer?.email || ""}<br>
        ${customer?.phone || ""}<br>
        ${customer?.altPhone ? "Alt: " + customer.altPhone : ""}
      </div>
    </div>
    <div>
      <div class="section-title">DELIVERY ADDRESS</div>
      <div class="info-text">${addrParts.join(", ") || "—"}</div>
    </div>
  </div>

  <div class="line"></div>

  <div class="info-strip">
    <div>
      <div class="strip-title">ORDER DATE</div>
      <div class="strip-value">${orderDateFormatted}</div>
    </div>
    <div>
      <div class="strip-title">PAYMENT METHOD</div>
      <div class="strip-value">${payMethodDisplay}</div>
    </div>
    <div>
      <div class="strip-title">PRODUCT DETAILS</div>
      <div class="strip-value">
        ${product?.productName || "—"}<br>
        Size: ${order.size || "—"}<br>
        Qty: ${qty}
      </div>
    </div>
  </div>

  <div class="line"></div>

  <table class="table">
    <tr>
      <th>DESCRIPTION</th>
      <th class="right">QTY</th>
      <th class="right">UNIT PRICE</th>
      <th class="right">AMOUNT</th>
    </tr>
    <tr>
      <td>${product?.productName || "—"}</td>
      <td class="right">${qty}</td>
      <td class="right">₹${fmt(price)}</td>
      <td class="right">₹${fmt(price)}</td>
    </tr>
    <tr>
      <td>Discount (${discount}%)</td>
      <td class="right">-</td>
      <td class="right">-</td>
      <td class="right">- ₹${fmt((price - finalPrice) * qty)}</td>
    </tr>
    <tr>
      <td>Subtotal</td>
      <td class="right">${qty}</td>
      <td class="right">₹${fmt(finalPrice)}</td>
      <td class="right">₹${fmt(finalPrice * qty)}</td>
    </tr>
    <tr>
      <td>Delivery Charges</td>
      <td class="right">-</td>
      <td class="right">-</td>
      <td class="right">${delivery === 0 ? "FREE" : "₹" + fmt(delivery)}</td>
    </tr>
    <tr>
      <td>Platform Charges</td>
      <td class="right">-</td>
      <td class="right">-</td>
      <td class="right">₹0</td>
    </tr>
    <tr class="total-row">
      <td>TOTAL AMOUNT PAYABLE</td>
      <td></td>
      <td></td>
      <td class="right">₹${fmt(total)}</td>
    </tr>
  </table>

  <div class="barcode-section">
    <svg id="bc-${order.orderId}" class="barcode-svg" data-barcode="${barcodeData}"></svg>
    <div class="barcode-id">SHIP:${order.orderId}</div>
  </div>

  <div class="line" style="border-style:dashed"></div>

  <div class="footer">
    <h3>Thank you for shopping with us! ✨</h3>
    <p>This is a computer-generated invoice.<br>No signature required.</p>
  </div>

</div>`;
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoices — Midnight Aura</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<style>
*{ margin:0; padding:0; box-sizing:border-box; }
body{ font-family:Arial,sans-serif; background:#fff; color:#111; }

.bill-page{
  width:900px;
  margin:auto;
  padding:30px;
  background:#fff;
  page-break-after:always;
}
.bill-page:last-child{ page-break-after:avoid; }

.line{ border-top:1px solid #d7d7d7; margin:25px 0; }

/* HEADER */
.header{ display:flex; justify-content:space-between; align-items:flex-start; }
.brand{ display:flex; align-items:center; gap:14px; }
.brand img{ width:60px; height:60px; }
.brand-name{ font-size:34px; font-weight:700; letter-spacing:1px; }
.brand-sub{ font-size:13px; letter-spacing:6px; color:#777; margin-top:6px; }
.order-side{ display:flex; align-items:flex-start; gap:25px; }
.order-info{ text-align:right; }
.order-label{ font-size:14px; color:#555; margin-bottom:8px; }
.order-id{ font-size:28px; font-weight:700; }
.order-date{ margin-top:8px; color:#444; font-size:14px; }
.qr-box{ width:110px; height:110px; flex-shrink:0; }

/* CUSTOMER */
.info-grid{ display:grid; grid-template-columns:1fr 1fr; gap:60px; }
.section-title{ font-size:14px; font-weight:700; margin-bottom:18px; }
.info-text{ font-size:15px; line-height:2; color:#222; }

/* STRIP */
.info-strip{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:30px; }
.strip-title{ font-size:14px; font-weight:700; margin-bottom:14px; }
.strip-value{ font-size:15px; line-height:1.8; }

/* TABLE */
.table{ width:100%; border-collapse:collapse; }
.table th{ text-align:left; padding:14px 10px; border-bottom:1px solid #ccc; font-size:14px; }
.table td{ padding:18px 10px; border-bottom:1px solid #eee; font-size:15px; }
.right{ text-align:right; }
.total-row td{ font-weight:700; font-size:18px; }

/* BARCODE */
.barcode-section{ text-align:center; margin-top:25px; }
.barcode-svg{ width:230px; height:45px; }
.barcode-id{ margin-top:8px; font-size:14px; }

/* FOOTER */
.footer{ text-align:center; margin-top:35px; }
.footer h3{ font-size:18px; margin-bottom:10px; }
.footer p{ color:#444; line-height:1.8; }

@media print {
  .bill-page{ page-break-after:always; }
  .bill-page:last-child{ page-break-after:avoid; }
}
</style>
</head>
<body>

${billPages.join("\n")}

<script>
(function(){
  // ── Generate QR codes ──────────────────────────────────────────────────────
  document.querySelectorAll('.qr-box[data-qr]').forEach(function(el){
    try {
      // data-qr holds JSON.stringify(qrData) which is already a string
      var raw = el.getAttribute('data-qr');
      new QRCode(el, {
  text: decodeURIComponent(raw),
  width: 110,
  height: 110
});
    } catch(e){ console.warn('QR error', e); }
  });

  // ── Generate barcodes ──────────────────────────────────────────────────────
  document.querySelectorAll('[data-barcode]').forEach(function(el){
    try {
      JsBarcode(el, el.getAttribute('data-barcode'), {
        format:       'CODE128',
        width:        1.5,
        height:       40,
        displayValue: false
      });
    } catch(e){ console.warn('Barcode error', e); }
  });

  // ── Print after assets have rendered ──────────────────────────────────────
  setTimeout(function(){ window.print(); }, 800);
})();
<\/script>

</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
}

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
      {s.dot && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: s.dot, flexShrink: 0,
        }} />
      )}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Stacked Fan Image Cell ───────────────────────────────────────────────────
function StackedImageCell({ images, onOpenLightbox }) {
  const validImages = (images || []).filter(Boolean);
  const thumbW = 40, thumbH = 52;

  if (validImages.length === 0) {
    return (
      <div style={{
        width: thumbW + 16, height: thumbH,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <div style={{
          width: thumbW, height: thumbH, borderRadius: 8,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      </div>
    );
  }

  const count   = validImages.length;
  const offsetX = 8;
  const totalW  = thumbW + (count - 1) * offsetX;

  return (
    <div style={{ position: "relative", width: totalW, height: thumbH, flexShrink: 0 }}>
      {validImages.map((img, i) => {
        const zIndex  = i + 1;
        const left    = i * offsetX;
        const scale   = 1 - (count - 1 - i) * 0.04;
        const opacity = 0.6 + (i / Math.max(count - 1, 1)) * 0.4;
        return (
          <div
            key={i}
            onClick={() => onOpenLightbox(images, i)}
            title={`View image ${i + 1}`}
            style={{
              position: "absolute", left, top: 0,
              width: thumbW, height: thumbH,
              borderRadius: 8, overflow: "hidden",
              background: "rgba(255,255,255,0.06)",
              border: i === count - 1
                ? "2px solid rgba(139,92,246,0.5)"
                : "1px solid rgba(255,255,255,0.12)",
              cursor: "zoom-in", zIndex,
              transform: `scale(${scale})`, transformOrigin: "bottom center",
              opacity, transition: "transform 0.15s, opacity 0.15s, border 0.15s",
              boxShadow: i === count - 1
                ? "0 4px 12px rgba(0,0,0,0.5)"
                : "0 2px 6px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.06)";
              e.currentTarget.style.opacity   = "1";
              e.currentTarget.style.zIndex    = "10";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = `scale(${scale})`;
              e.currentTarget.style.opacity   = `${opacity}`;
              e.currentTarget.style.zIndex    = `${zIndex}`;
            }}
          >
            <img
              src={getImageUrl(img)}
              alt={`product ${i + 1}`}
              style={{
                width: "100%", height: "100%", objectFit: "cover",
                display: "block", pointerEvents: "none",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── Image / Lightbox Modal ───────────────────────────────────────────────────
function ImageModal({ images, productName, initialIdx, onClose }) {
  const [visible, setVisible] = useState(false);
  const [idx, setIdx]         = useState(initialIdx ?? 0);
  const validImages = (images || []).filter(Boolean);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    const onKey = (e) => {
      if (e.key === "Escape")      handleClose();
      if (e.key === "ArrowLeft")   setIdx(i => (i - 1 + validImages.length) % validImages.length);
      if (e.key === "ArrowRight")  setIdx(i => (i + 1) % validImages.length);
    };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [validImages.length]); // eslint-disable-line
const touchStartX = useRef(0);
const touchEndX = useRef(0);

const handleTouchStart = (e) => {
  touchStartX.current = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e) => {
  touchEndX.current = e.changedTouches[0].screenX;

  const diff = touchStartX.current - touchEndX.current;

  if (diff > 50) {
    setIdx((i) => (i + 1) % validImages.length);
  }

  if (diff < -50) {
    setIdx((i) => (i - 1 + validImages.length) % validImages.length);
  }
};
  const handleClose = () => { setVisible(false); setTimeout(onClose, 240); };

  if (!validImages.length) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 99999,
        background: visible ? "rgba(0,0,0,0.96)" : "rgba(0,0,0,0)",
        backdropFilter:       visible ? "blur(20px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(20px)" : "blur(0px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.24s ease, backdrop-filter 0.24s ease",
        cursor: "zoom-out",
      }}
    >
      <button
        onClick={e => { e.stopPropagation(); handleClose(); }}
        style={{
          position: "fixed", top: 18, right: 18, width: 46, height: 46,
          borderRadius: "50%", background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)", color: "#fff",
          fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 100000,
          opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.7)",
          transition: "background 0.15s, transform 0.15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background  = "rgba(255,255,255,0.2)";
          e.currentTarget.style.transform   = "scale(1.1)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background  = "rgba(255,255,255,0.08)";
          e.currentTarget.style.transform   = "scale(1)";
        }}
      >✕</button>

      {validImages.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + validImages.length) % validImages.length); }}
            style={{
              position: "fixed", left: 18, top: "50%", transform: "translateY(-50%)",
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff", fontSize: 22, display: "flex",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 100000, backdropFilter: "blur(8px)",
              opacity: visible ? 1 : 0, transition: "opacity 0.2s, background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >‹</button>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % validImages.length); }}
            style={{
              position: "fixed", right: 18, top: "50%", transform: "translateY(-50%)",
              width: 48, height: 48, borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff", fontSize: 22, display: "flex",
              alignItems: "center", justifyContent: "center",
              cursor: "pointer", zIndex: 100000, backdropFilter: "blur(8px)",
              opacity: visible ? 1 : 0, transition: "opacity 0.2s, background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.22)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
          >›</button>
        </>
      )}

    <div
  onClick={e => e.stopPropagation()}
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  style={{
    position: "relative",

    width: window.innerWidth <= 768 ? "100vw" : "min(500px, 88vw)",
    height: window.innerWidth <= 768 ? "100vh" : "88vh",

    maxWidth: "100vw",
    maxHeight: "100vh",

    borderRadius: window.innerWidth <= 768 ? 0 : 22,

    overflow: "hidden",

    background: "#000",

    boxShadow:
      window.innerWidth <= 768
        ? "none"
        : "0 60px 160px rgba(0,0,0,0.95), 0 0 0 1px rgba(139,92,246,0.3)",

    transform: visible
      ? "scale(1) translateY(0)"
      : "scale(0.76) translateY(40px)",

    opacity: visible ? 1 : 0,

    transition:
      "transform 0.32s cubic-bezier(0.34,1.42,0.64,1), opacity 0.22s ease",

    cursor: "default",

    touchAction: "pan-y",
  }}
>
  <img
    src={getImageUrl(validImages[idx])}
    alt={productName}
    draggable={false}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      userSelect: "none",
      WebkitUserDrag: "none",
    }}
  />

  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,

      padding:
        window.innerWidth <= 768
          ? "70px 18px 28px"
          : "48px 22px 22px",

      background:
        "linear-gradient(transparent, rgba(0,0,0,0.92))",
    }}
  >
    <div
      style={{
        color: "#fff",
        fontWeight: 700,
        fontSize: window.innerWidth <= 768 ? 20 : 16,
      }}
    >
      {productName}
    </div>

    {validImages.length > 1 && (
      <div
        style={{
          display: "flex",
          gap: 5,
          marginTop: 10,
          justifyContent: "center",
        }}
      >
        {validImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              width: i === idx ? 22 : 6,
              height: 6,
              borderRadius: 3,
              background:
                i === idx
                  ? "#a78bfa"
                  : "rgba(255,255,255,0.4)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "width 0.2s",
            }}
          />
        ))}
      </div>
    )}

    <div
      style={{
        color: "rgba(255,255,255,0.45)",
        fontSize: 11,
        marginTop: 8,
        textAlign: "center",
      }}
    >
      Swipe left/right to navigate
    </div>
  </div>
</div>
    </div>
  );
}

// ─── Cancel reason modal ──────────────────────────────────────────────────────
const CANCEL_REASONS = [
  "Out of stock",
  "Customer requested cancellation",
  "Payment issue",
  "Duplicate order",
  "Other",
];

function CancelModal({ order, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
    }}>
      <div style={{
        borderRadius: 20, padding: 24, width: "100%", maxWidth: 360,
        background: "#0f0f14", border: "1px solid rgba(239,68,68,0.2)",
      }}>
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>
          Cancel Order
        </h3>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: "0 0 16px" }}>
          #{order.orderId} · {order.product?.productName}
        </p>
        <label style={{
          fontSize: 11, fontWeight: 700,
          color: "rgba(255,255,255,0.45)", display: "block", marginBottom: 6,
        }}>
          Reason
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: "100%", borderRadius: 12, padding: "9px 12px",
            fontSize: 13, marginBottom: 18, outline: "none", boxSizing: "border-box",
            background: "#07070A", border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
          }}
        >
          {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "10px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
            }}
          >Back</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            style={{
              flex: 1, padding: "10px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "rgba(239,68,68,0.18)", color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.3)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Cancelling…" : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <>
      <style>{`
        @keyframes sk-order-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .sk-o {
          background: linear-gradient(90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.09) 50%,
            rgba(255,255,255,0.04) 75%);
          background-size: 600px 100%;
          animation: sk-order-shimmer 1.4s infinite linear;
          border-radius: 7px;
        }
      `}</style>
      <div style={{
        display: "grid", gridTemplateColumns: COL,
        width: "100%", padding: "12px 16px",
        alignItems: "center", gap: 0,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="sk-o"
              style={{ width: 40, height: 52, borderRadius: 8, opacity: 1 - i * 0.2, flexShrink: 0 }} />
          ))}
        </div>
        <div className="sk-o" style={{ width: 90,  height: 13 }} />
        <div className="sk-o" style={{ width: "80%", height: 13 }} />
        <div className="sk-o" style={{ width: "70%", height: 13 }} />
        <div className="sk-o" style={{ width: 48,  height: 13, marginLeft: "auto" }} />
        <div className="sk-o" style={{ width: 36,  height: 13, margin: "0 auto" }} />
        <div className="sk-o" style={{ width: 68,  height: 22, borderRadius: 20, margin: "0 auto" }} />
        <div className="sk-o" style={{ width: 72,  height: 22, borderRadius: 20, margin: "0 auto" }} />
        <div className="sk-o" style={{ width: 90,  height: 28, borderRadius: 10, marginLeft: "auto" }} />
        <div className="sk-o" style={{ width: 28,  height: 28, borderRadius: 9,  margin: "0 auto" }} />
      </div>
    </>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;
  const pages = [];
  for (let i = 1; i <= total; i++) pages.push(i);
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
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 6, padding: "20px 0 4px", flexWrap: "wrap",
    }}>
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        style={{
          ...btnBase, padding: "0 12px",
          background: "rgba(255,255,255,0.04)",
          color: current === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
          cursor: current === 1 ? "not-allowed" : "pointer",
        }}
      >← Prev</button>

      {visible.map((p, i) =>
        p === "..." ? (
          <span key={`e-${i}`} style={{ color: "rgba(255,255,255,0.3)", padding: "0 4px", fontSize: 13 }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              ...btnBase,
              background: p === current
                ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                : "rgba(255,255,255,0.04)",
              color: p === current ? "#fff" : "rgba(255,255,255,0.55)",
              border: p === current
                ? "1px solid rgba(139,92,246,0.5)"
                : "1px solid rgba(255,255,255,0.08)",
              boxShadow: p === current ? "0 4px 14px rgba(109,40,217,0.35)" : "none",
            }}
          >{p}</button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        style={{
          ...btnBase, padding: "0 12px",
          background: "rgba(255,255,255,0.04)",
          color: current === total ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
          cursor: current === total ? "not-allowed" : "pointer",
        }}
      >Next →</button>
    </div>
  );
}

// ─── Single order row ─────────────────────────────────────────────────────────
function OrderRow({ order, onImageClick, onAccept, onCancelRequest, acceptLoad }) {
  const navigate = useNavigate();
  const images   = order.product?.productImages ?? [];

  const renderActions = () => {
    switch (order.orderState) {
      case "PLACED":
        return (
          <>
            <button
              onClick={() => onAccept(order)}
              disabled={!!acceptLoad}
              style={{
                padding: "5px 10px", borderRadius: 9, fontSize: 11, fontWeight: 700,
                background: "rgba(34,197,94,0.15)", color: "#86efac",
                border: "1px solid rgba(34,197,94,0.3)",
                cursor: acceptLoad ? "not-allowed" : "pointer",
                opacity: acceptLoad ? 0.6 : 1, whiteSpace: "nowrap",
              }}
            >
              {acceptLoad === order.orderId ? "…" : "Accept"}
            </button>
            <button
              onClick={() => onCancelRequest(order)}
              style={{
                padding: "5px 10px", borderRadius: 9, fontSize: 11, fontWeight: 700,
                background: "rgba(239,68,68,0.12)", color: "#fca5a5",
                border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Cancel
            </button>
          </>
        );
      case "CONFIRMED":
        return (
          <button
            onClick={() => onCancelRequest(order)}
            style={{
              padding: "5px 10px", borderRadius: 9, fontSize: 11, fontWeight: 700,
              background: "rgba(239,68,68,0.12)", color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Cancel
          </button>
        );
      default:
        return <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>—</span>;
    }
  };

  const handleRowClick = (e) => {
    if (e.target.closest("button") || e.target.closest("select")) return;
    navigate(`/admin/orders/${order.orderId}`);
  };

  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: COL,
        width: "100%", padding: "10px 16px",
        alignItems: "center", gap: 0,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer", transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(139,92,246,0.05)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      onClick={handleRowClick}
    >
      {/* Images */}
      <div onClick={e => e.stopPropagation()}>
        <StackedImageCell
          images={images}
          onOpenLightbox={(imgs, idx) =>
            onImageClick({ images: imgs, productName: order.product?.productName, initialIdx: idx })
          }
        />
      </div>

      {/* Order ID */}
      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#a78bfa" }}>
        #{order.orderId}
      </span>

      {/* Product */}
      <div style={{ minWidth: 0 }}>
        <p style={{
          color: "#fff", fontSize: 13, fontWeight: 600, margin: 0,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {order.product?.productName ?? "—"}
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
          {order.size && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              Size: <span style={{ color: "#c4b5fd", fontWeight: 600 }}>{order.size.toUpperCase()}</span>
            </span>
          )}
          {order.quantity != null && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              Qty: <span style={{ color: "#fbbf24", fontWeight: 600 }}>{order.quantity}</span>
            </span>
          )}
        </div>
      </div>

      {/* Customer */}
      <p style={{
        color: "rgba(255,255,255,0.72)", fontSize: 13, margin: 0,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {order.customer?.username || order.customer?.email?.split("@")[0] || "—"}
      </p>

      {/* Amount */}
      <div style={{ textAlign: "right" }}>
        <p style={{ color: "#fbbf24", fontWeight: 700, fontSize: 13, margin: 0 }}>
          ₹{order.totalPrice}
        </p>
        {order.deliveryCharge > 0 && (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: 0 }}>
            +₹{order.deliveryCharge} del
          </p>
        )}
      </div>

      {/* Date */}
      <p style={{
        color: "rgba(255,255,255,0.38)", fontSize: 11, margin: 0,
        textAlign: "center", whiteSpace: "nowrap",
      }}>
        {new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "2-digit",
        })}
      </p>

      {/* Payment status */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <StatusBadge status={order.paymentStatus} styles={PAY_STATUS_STYLES} />
      </div>

      {/* Order state */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <StatusBadge status={order.orderState} styles={ORDER_STATUS_STYLES} />
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex", gap: 6, justifyContent: "center",
          alignItems: "center", width: "100%",
        }}
        onClick={e => e.stopPropagation()}
      >
        {renderActions()}
      </div>

      {/* View */}
      <div style={{ display: "flex", justifyContent: "center" }} onClick={e => e.stopPropagation()}>
        <button
          onClick={() => navigate(`/admin/orders/${order.orderId}`)}
          title="View order details"
          style={{
            padding: "6px 8px", borderRadius: 9,
            background: "rgba(34,197,94,0.1)", color: "#4ade80",
            border: "1px solid rgba(34,197,94,0.22)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s, transform 0.12s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background  = "rgba(34,197,94,0.22)";
            e.currentTarget.style.transform   = "scale(1.08)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = "rgba(34,197,94,0.1)";
            e.currentTarget.style.transform   = "scale(1)";
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminOrder() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [active,      setActive]      = useState("All");
  const [search,      setSearch]      = useState("");
  const [lightbox,    setLightbox]    = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelLoad,  setCancelLoad]  = useState(false);
  const [acceptLoad,  setAcceptLoad]  = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/product/fetchOrders");
        if (res.data.success) setOrders(res.data.orders);
        else setError("Failed to load orders.");
      } catch (err) {
        console.error("fetchOrders error", err);
        setError("Something went wrong while fetching orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Accept ────────────────────────────────────────────────────────────────
  const handleAccept = useCallback(async (order) => {
    const nextState =
      order.orderState === "PLACED"    ? "CONFIRMED" :
      order.orderState === "CONFIRMED" ? "SHIPPED"   : "DELIVERED";

    setAcceptLoad(order.orderId);
    try {
      const res = await API.put(
        `/productBuy/updateOrderStatus/${order.orderId}`,
        { orderState: nextState }
      );
      if (res.data.success) {
        setOrders(prev =>
          prev.map(o => o.orderId === order.orderId ? { ...o, orderState: nextState } : o)
        );
      }
    } catch (err) {
      console.error("acceptOrder error", err);
    } finally {
      setAcceptLoad(null);
    }
  }, []);

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancelConfirm = useCallback(async (reason) => {
    if (!cancelOrder) return;
    setCancelLoad(true);
    try {
      const res = await API.put(
        `/productBuy/updateOrderStatus/${cancelOrder.orderId}`,
        { orderState: "CANCELLED", reason }
      );
      if (res.data.success) {
        setOrders(prev =>
          prev.map(o =>
            o.orderId === cancelOrder.orderId
              ? { ...o, orderState: "CANCELLED", cancellationReason: reason, cancelledAt: new Date() }
              : o
          )
        );
        setCancelOrder(null);
      }
    } catch (err) {
      console.error("cancelOrder error", err);
    } finally {
      setCancelLoad(false);
    }
  }, [cancelOrder]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = orders.filter(o => {
    const matchStatus = active === "All" || o.orderState === active;
    const q = search.toLowerCase();
    const matchSearch =
      o.orderId?.toLowerCase().includes(q) ||
      o.product?.productName?.toLowerCase().includes(q) ||
      o.customer?.username?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  useEffect(() => { setCurrentPage(1); }, [active, search]);

  const totalPages      = Math.max(1, Math.ceil(filtered.length / ORDERS_PER_PAGE));
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All"
      ? orders.length
      : orders.filter(o => o.orderState === f).length;
    return acc;
  }, {});

  const SUMMARY = [
    { key: "PLACED",    label: "Placed"    },
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "SHIPPED",   label: "Shipped"   },
    { key: "DELIVERED", label: "Delivered" },
     { key: "RETURNED", label: "Returned" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  // Print Bills: only visible when SHIPPED filter is active
  // Print Bills: only visible when CONFIRMED filter is active
const showPrintBills = active === "CONFIRMED";

  const handlePrintBills = () => {
    if (filtered.length === 0) return;
    printAllBills(filtered);
  };

  return (
    <>
      <style>{`
        .order-x-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .order-x-scroll::-webkit-scrollbar { height: 5px; }
        .order-x-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 10px; }
        .order-x-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.35); border-radius: 10px; }
        .order-x-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.6); }
      `}</style>

      <div>
        {/* ── Header ── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 800, margin: 0 }}>Orders</h1>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, margin: "4px 0 0" }}>
            {loading
              ? "Loading…"
              : `${orders.length} total order${orders.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* ── Summary cards ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(2,1fr)",
          gap: 12, marginBottom: 20,
        }}>
          <style>{`
            @media(min-width:640px){
              .order-summary-grid { grid-template-columns: repeat(5,1fr) !important; }
            }
          `}</style>
          {SUMMARY.map(({ key, label }) => {
            const st = ORDER_STATUS_STYLES[key];
            return (
              <button
                key={key}
                className="order-summary-grid"
                onClick={() => setActive(key)}
                style={{
                  borderRadius: 14, padding: "12px 14px",
                  display: "flex", alignItems: "center", gap: 12,
                  textAlign: "left", cursor: "pointer",
                  background: active === key ? st.bg : "rgba(255,255,255,0.04)",
                  border: active === key
                    ? `1px solid ${st.border}`
                    : "1px solid rgba(255,255,255,0.08)",
                  transition: "all 0.18s",
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: st.bg, border: `1px solid ${st.border}`,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: st.color }}>
                    {counts[key]}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: st.color, margin: 0 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0 }}>
                    orders
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Filter tabs + search + (conditional) Print Bills ── */}
        <div style={{
          borderRadius: 16, padding: "12px 14px", marginBottom: 14,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center",
        }}>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActive(f)}
                style={{
                  padding: "6px 12px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap",
                  ...(active === f
                    ? {
                        background: "linear-gradient(135deg,rgba(139,92,246,0.28),rgba(124,58,237,0.18))",
                        color: "#c4b5fd",
                        border: "1px solid rgba(139,92,246,0.4)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.45)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                  ),
                }}
              >
                {FILTER_LABELS[f]}
                {f !== "All" && (
                  <span style={{ opacity: 0.5 }}> ({counts[f]})</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", minWidth: 200 }}>
            <svg
              style={{
                position: "absolute", left: 10, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }}
              width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search orders, customers…"
              style={{
                width: "100%",
                paddingLeft: 30, paddingRight: 14, paddingTop: 8, paddingBottom: 8,
                fontSize: 12, borderRadius: 10, outline: "none", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)", caretColor: "#a78bfa",
              }}
            />
          </div>

          {/* ── Print Bills: only shown when SHIPPED filter is active ── */}
          {showPrintBills && (
            <button
              onClick={handlePrintBills}
              disabled={loading || filtered.length === 0}
              title={
                filtered.length === 0
                  ? "No shipped orders to print"
                  : `Print ${filtered.length} shipped bill${filtered.length !== 1 ? "s" : ""}`
              }
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 10,
                background: loading || filtered.length === 0
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(6,182,212,0.15)",
                color: loading || filtered.length === 0
                  ? "rgba(255,255,255,0.25)"
                  : "#67e8f9",
                border: loading || filtered.length === 0
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid rgba(6,182,212,0.35)",
                cursor: loading || filtered.length === 0 ? "not-allowed" : "pointer",
                fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                transition: "all 0.18s",
              }}
              onMouseEnter={e => {
                if (!loading && filtered.length > 0)
                  e.currentTarget.style.background = "rgba(6,182,212,0.28)";
              }}
              onMouseLeave={e => {
                if (!loading && filtered.length > 0)
                  e.currentTarget.style.background = "rgba(6,182,212,0.15)";
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/>
              </svg>
              Print Bills
              {!loading && filtered.length > 0 && (
                <span style={{
                  background: "rgba(6,182,212,0.25)", color: "#67e8f9",
                  borderRadius: 6, padding: "1px 6px", fontSize: 10, fontWeight: 800,
                  border: "1px solid rgba(6,182,212,0.35)",
                }}>
                  {filtered.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* ── Table (x-scrollable) ── */}
        <div
          className="order-x-scroll"
          style={{
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          {/* Header row */}
          <div style={{
            display: "grid", gridTemplateColumns: COL,
            width: "100%", padding: "10px 16px",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.28)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.02)", gap: 0,
          }}>
            <span>Images</span>
            <span>Order ID</span>
            <span>Product</span>
            <span>Customer</span>
            <span style={{ textAlign: "right" }}>Amount</span>
            <span style={{ textAlign: "center" }}>Date</span>
            <span style={{ textAlign: "center" }}>Payment</span>
            <span style={{ textAlign: "center" }}>Status</span>
            <span style={{ textAlign: "center" }}>Actions</span>
            <span style={{ textAlign: "center" }}>View</span>
          </div>

          {/* Skeleton */}
          {loading && Array.from({ length: ORDERS_PER_PAGE }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}

          {/* Error */}
          {!loading && error && (
            <div style={{
              padding: "60px 16px", textAlign: "center",
              color: "#fca5a5", fontSize: 13, minWidth: TABLE_MIN_WIDTH,
            }}>
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{
              padding: "60px 16px", textAlign: "center",
              color: "rgba(255,255,255,0.3)", fontSize: 13, minWidth: TABLE_MIN_WIDTH,
            }}>
              No orders found.
            </div>
          )}

          {/* Rows (paginated) */}
          {!loading && !error && paginatedOrders.map(o => (
            <OrderRow
              key={o.orderId}
              order={o}
              onImageClick={setLightbox}
              onAccept={handleAccept}
              onCancelRequest={setCancelOrder}
              acceptLoad={acceptLoad}
            />
          ))}
        </div>

        {/* ── Pagination ── */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <div style={{
              textAlign: "center", fontSize: 12,
              color: "rgba(255,255,255,0.28)", marginBottom: 4,
            }}>
              Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}–
              {Math.min(currentPage * ORDERS_PER_PAGE, filtered.length)} of {filtered.length}{" "}
              order{filtered.length !== 1 ? "s" : ""}
            </div>
            <Pagination
              current={currentPage}
              total={totalPages}
              onChange={handlePageChange}
            />
          </div>
        )}

        {/* ── Modals ── */}
        {lightbox && (
          <ImageModal
            images={lightbox.images}
            productName={lightbox.productName}
            initialIdx={lightbox.initialIdx}
            onClose={() => setLightbox(null)}
          />
        )}
        {cancelOrder && (
          <CancelModal
            order={cancelOrder}
            onConfirm={handleCancelConfirm}
            onClose={() => setCancelOrder(null)}
            loading={cancelLoad}
          />
        )}
      </div>
    </>
  );
}