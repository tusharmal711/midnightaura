import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../api";
import appLogo from "../../assets/images/appImage/app-logo.png";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const BASE_URL = "https://www.chomoktomok.com";
const getImageUrl = (img) => {
  if (!img) return "";
  if (img.startsWith("http")) return img;
  if (img.startsWith("data:image")) return img;
  return `${BASE_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const PAY_METHOD_LABEL = {
  COD: "Cash on Delivery",
  CARD: "Card",
  UPI: "UPI",
};

// ─── Notification helper ───────────────────────────────────────────────────────
// Calls POST /user/sendNotification with customerId + message based on new state.
// Fires-and-forgets — errors are logged but never surface to the user.
const NOTIFICATION_CONTENT = {
  SHIPPED: {
    title: "📦 Your order has been shipped!",
    body: "Great news! Your order is on its way. Our delivery partner will contact you soon.",
  },
  CONFIRMED: {
    title: "✅ Order Confirmed",
    body: "Your order has been confirmed and is being prepared.",
  },
  CANCELLED: {
    title: "❌ Order Cancelled",
    body: "Unfortunately your order has been cancelled. Contact support for assistance.",
  },
  DELIVERED: {
    title: "🎉 Order Delivered!",
    body: "Your order has been delivered successfully. We hope you love it!",
  },
};

async function sendOrderNotification(customerId, newState, orderId) {
  const content = NOTIFICATION_CONTENT[newState];

  if (!content || !customerId) return;

  try {
    await API.post("/user/sendNotification", {
      customerId,
      title: content.title,
      body: `Order #${orderId} — ${content.body}`,
    });
  } catch (err) {
    console.warn("sendOrderNotification failed (non-critical):", err?.message);
  }
}

// ─── Status config ─────────────────────────────────────────────────────────────
const ORDER_STATUS_STYLES = {
  PLACED:    { bg: "rgba(139,92,246,0.12)", color: "#c4b5fd", border: "rgba(139,92,246,0.35)", dot: "#a78bfa" },
  CONFIRMED: { bg: "rgba(59,130,246,0.12)", color: "#93c5fd", border: "rgba(59,130,246,0.35)", dot: "#60a5fa" },
  SHIPPED:   { bg: "rgba(6,182,212,0.12)",  color: "#67e8f9", border: "rgba(6,182,212,0.35)",  dot: "#22d3ee" },
  DELIVERED: { bg: "rgba(34,197,94,0.12)",  color: "#86efac", border: "rgba(34,197,94,0.35)",  dot: "#4ade80" },
  CANCELLED: { bg: "rgba(239,68,68,0.12)",  color: "#fca5a5", border: "rgba(239,68,68,0.35)",  dot: "#f87171" },
};

const PAY_STATUS_STYLES = {
  PENDING: { bg: "rgba(234,179,8,0.12)", color: "#fde68a", border: "rgba(234,179,8,0.3)" },
  PAID:    { bg: "rgba(34,197,94,0.12)", color: "#86efac", border: "rgba(34,197,94,0.3)" },
  FAILED:  { bg: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "rgba(239,68,68,0.3)" },
};

function StatusBadge({ status, styles }) {
  const s = styles[status];
  if (!s) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 700,
      padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {s.dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ title, icon, children, style }) {
  return (
    <div style={{
      borderRadius: 18,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.04)",
      overflow: "hidden",
      ...style,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.02)",
      }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "0.01em" }}>{title}</span>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

// ─── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ label, value, accent, mono }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600 }}>{label}</span>
      <span style={{
        color: accent || "rgba(255,255,255,0.82)",
        fontSize: 13,
        fontWeight: accent ? 700 : 500,
        fontFamily: mono ? "monospace" : "inherit",
        textAlign: "right",
        maxWidth: "60%",
      }}>{value ?? "—"}</span>
    </div>
  );
}

// ─── Cancel Reason Modal ───────────────────────────────────────────────────────
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
      background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)",
    }}>
      <div style={{
        borderRadius: 20, padding: 24, width: "100%", maxWidth: 380,
        background: "#0f0f14", border: "1px solid rgba(239,68,68,0.22)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.9)",
      }}>
        <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 800, margin: "0 0 4px" }}>Cancel Order</h3>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, margin: "0 0 18px" }}>
          #{order.orderId} · {order.product?.productName}
        </p>
        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
          Reason
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: "100%", borderRadius: 12, padding: "10px 12px",
            fontSize: 13, marginBottom: 20, outline: "none", boxSizing: "border-box",
            background: "#07070A", border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
          }}
        >
          {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "11px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
            }}
          >Back</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            style={{
              flex: 1, padding: "11px", borderRadius: 12, fontSize: 13, fontWeight: 700,
              background: "rgba(239,68,68,0.18)", color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.3)",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            }}
          >{loading ? "Cancelling…" : "Confirm Cancel"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Print Bill ────────────────────────────────────────────────────────────────
function printBill(order) {
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

  const payMethodDisplay = PAY_METHOD_LABEL[order.payMethod] || order.payMethod || order.paymentMode || "—";

  const orderDateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const qrData = JSON.stringify({
    orderId: order.orderId,
    orderState: order.orderState,
    customer: { name: customer?.username, phone: customer?.phone },
    product: { name: product?.productName, size: order.size, quantity: order.quantity },
    total,
  });

  const barcodeData = `SHIP:${order.orderId}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<style>
*{ margin:0; padding:0; box-sizing:border-box; }
body{ font-family:Arial,sans-serif; background:#fff; color:#111; }
.page{ width:900px; margin:auto; padding:30px; background:#fff; }
.line{ border-top:1px solid #d7d7d7; margin:25px 0; }
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
.qr-box{ width:110px; height:110px; }
.info-grid{ display:grid; grid-template-columns:1fr 1fr; gap:60px; }
.section-title{ font-size:14px; font-weight:700; margin-bottom:18px; }
.info-text{ font-size:15px; line-height:2; color:#222; }
.info-strip{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:30px; }
.strip-title{ font-size:14px; font-weight:700; margin-bottom:14px; }
.strip-value{ font-size:15px; line-height:1.8; }
.table{ width:100%; border-collapse:collapse; }
.table th{ text-align:left; padding:14px 10px; border-bottom:1px solid #ccc; font-size:14px; }
.table td{ padding:18px 10px; border-bottom:1px solid #eee; font-size:15px; }
.right{ text-align:right; }
.total-row td{ font-weight:700; font-size:18px; }
.barcode-section{ text-align:center; margin-top:25px; }
#billBarcode{ width:230px; height:45px; }
.barcode-id{ margin-top:8px; font-size:14px; }
.footer{ text-align:center; margin-top:35px; }
.footer h3{ font-size:18px; margin-bottom:10px; }
.footer p{ color:#444; line-height:1.8; }
</style>
</head>
<body>
<div class="page">
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
    <div id="billQrCode" class="qr-box"></div>
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
      Alt: ${customer?.altPhone || ""}
    </div>
  </div>
  <div>
    <div class="section-title">DELIVERY ADDRESS</div>
    <div class="info-text">${addrParts.join(", ")}</div>
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
      ${product?.productName}<br>
      Size: ${order.size}<br>
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
  <td>${product?.productName}</td>
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
  <td class="right">₹${fmt(finalPrice)}</td>
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
  <svg id="billBarcode"></svg>
  <div class="barcode-id">SHIP:${order.orderId}</div>
</div>
<div class="line" style="border-style:dashed"></div>
<div class="footer">
  <h3>Thank you for shopping with us! ✨</h3>
  <p>This is a computer-generated invoice.<br>No signature required.</p>
</div>
</div>
<script>
new QRCode(document.getElementById("billQrCode"),{
  text:${JSON.stringify(qrData)},
  width:110,
  height:110
});
JsBarcode("#billBarcode", "${barcodeData}", {
  format:"CODE128",
  width:1.5,
  height:40,
  displayValue:false
});
setTimeout(()=>{ window.print(); },500);
<\/script>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ w, h, radius = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
      backgroundSize: "600px 100%",
      animation: "skShimmer 1.4s infinite linear",
    }} />
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelLoad, setCancelLoad] = useState(false);
  const [actionLoad, setActionLoad] = useState(false);
  const [toast,      setToast]      = useState(null);
  const [imgIdx,     setImgIdx]     = useState(0);
  const [lightbox,   setLightbox]   = useState(false);
  const toastRef    = useRef(null);

  // ── Barcode keyboard scan listener ──────────────────────────────────────────
  const scanBufferRef = useRef("");
  const scanTimerRef  = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Ship order ───────────────────────────────────────────────────────────────
  // After a successful SHIPPED status update, fires a push notification to the customer.
  const handleShip = useCallback(async (sourceOrder) => {
    const target = sourceOrder || order;
    if (!target) return;
    setActionLoad(true);
    try {
      const res = await API.put(`/productBuy/updateOrderStatus/${target.orderId}`, { orderState: "SHIPPED" });
      if (res.data.success) {
        setOrder((prev) => ({ ...prev, orderState: "SHIPPED" }));
        showToast("Order marked as Shipped ✓");

        // ── Send push notification to customer ──
        await sendOrderNotification(
          target.customer?.customerId,
          "SHIPPED",
          target.orderId
        );
      }
    } catch (err) {
      console.error("ship error", err);
      showToast("Failed to update status", "error");
    } finally {
      setActionLoad(false);
    }
  }, [order, showToast]);

  // ── Barcode scanner effect ───────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "select" || tag === "textarea") return;

      if (e.key === "Enter") {
        const buf = scanBufferRef.current.trim();
        scanBufferRef.current = "";
        clearTimeout(scanTimerRef.current);

        const match = buf.match(/^SHIP:(.+)$/);
        if (match) {
          const scannedOrderId = match[1];
          setOrder((prev) => {
            if (prev && prev.orderId === scannedOrderId && prev.orderState === "CONFIRMED") {
              handleShip(prev);
            } else if (prev && prev.orderId === scannedOrderId) {
              showToast(`Order is already ${prev.orderState}`, "error");
            }
            return prev;
          });
        }
      } else if (e.key.length === 1) {
        scanBufferRef.current += e.key;
        clearTimeout(scanTimerRef.current);
        scanTimerRef.current = setTimeout(() => { scanBufferRef.current = ""; }, 500);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleShip, showToast]);

  // ── Fetch order ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/product/fetchOrders/${orderId}`);
        if (res.data.success) setOrder(res.data.order);
        else setError("Order not found.");
      } catch (err) {
        console.error("fetchOrderById error", err);
        setError("Failed to load order.");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  // ── Cancel shipment (revert to CONFIRMED) ────────────────────────────────────
  // Notifies the customer that the order is confirmed again.
  const handleCancelShip = useCallback(async () => {
    if (!order) return;
    setActionLoad(true);
    try {
      const res = await API.put(`/productBuy/updateOrderStatus/${order.orderId}`, { orderState: "CONFIRMED" });
      if (res.data.success) {
        setOrder((prev) => ({ ...prev, orderState: "CONFIRMED" }));
        showToast("Shipment cancelled — reverted to Confirmed");

        // ── Send push notification to customer ──
        await sendOrderNotification(
          order.customer?.customerId,
          "CONFIRMED",
          order.orderId
        );
      }
    } catch (err) {
      console.error("cancelShip error", err);
      showToast("Failed to update status", "error");
    } finally {
      setActionLoad(false);
    }
  }, [order, showToast]);

  // ── Cancel order ─────────────────────────────────────────────────────────────
  // Notifies the customer that the order has been cancelled.
  const handleCancelConfirm = useCallback(async (reason) => {
    if (!order) return;
    setCancelLoad(true);
    try {
      const res = await API.put(`/productBuy/updateOrderStatus/${order.orderId}`, { orderState: "CANCELLED", reason });
      if (res.data.success) {
        setOrder((prev) => ({
          ...prev,
          orderState: "CANCELLED",
          cancellationReason: reason,
          cancelledAt: new Date(),
        }));
        setShowCancel(false);
        showToast("Order cancelled");

        // ── Send push notification to customer ──
        await sendOrderNotification(
          order.customer?.customerId,
          "CANCELLED",
          order.orderId
        );
      }
    } catch (err) {
      console.error("cancel error", err);
      showToast("Failed to cancel order", "error");
    } finally {
      setCancelLoad(false);
    }
  }, [order, showToast]);

  // ── Derived state ────────────────────────────────────────────────────────────
  const images      = order?.product?.productImages ?? [];
  const isConfirmed = order?.orderState === "CONFIRMED";
  const isShipped   = order?.orderState === "SHIPPED";
  const isPlaced    = order?.orderState === "PLACED";
  const isDone      = ["DELIVERED", "CANCELLED"].includes(order?.orderState);
  const canCancel   = order?.orderState === "CONFIRMED";
  const showPrintBill = order && !isPlaced;

  const price      = Number(order?.product?.price || 0);
  const discount   = Number(order?.product?.discount || 0);
  const finalPrice = Number(order?.product?.finalPrice || price);
  const qty        = Number(order?.quantity || 1);
  const delivery   = Number(order?.deliveryCharge || 0);
  const total      = Number(order?.totalPrice || (finalPrice * qty + delivery));

  const addrParts = [
    order?.deliveryAddress?.addressLine1,
    order?.deliveryAddress?.addressLine2,
    order?.deliveryAddress?.city,
    order?.deliveryAddress?.district,
    order?.deliveryAddress?.state,
    order?.deliveryAddress?.pincode,
    order?.deliveryAddress?.country,
  ].filter(Boolean);

  return (
    <>
      <style>{`
        @keyframes skShimmer {
          0%   { background-position:-600px 0; }
          100% { background-position: 600px 0; }
        }
        @keyframes toastIn {
          from { opacity:0; transform:translateY(16px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .od-section { animation: fadeIn 0.3s ease both; }
        .od-img-thumb {
          cursor:pointer; transition:all 0.15s;
          border:2px solid transparent; border-radius:10px; overflow:hidden;
        }
        .od-img-thumb:hover { transform:scale(1.04); }
        .od-img-thumb.active { border-color: rgba(139,92,246,0.7); }
      `}</style>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 99999,
          padding: "12px 22px", borderRadius: 14,
          background: toast.type === "error" ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.18)",
          border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
          color: toast.type === "error" ? "#fca5a5" : "#86efac",
          fontSize: 13, fontWeight: 700,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          backdropFilter: "blur(12px)",
          animation: "toastIn 0.28s cubic-bezier(0.34,1.42,0.64,1) both",
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && images.length > 0 && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 99998,
            background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            style={{
              position: "fixed", top: 18, right: 18, width: 44, height: 44,
              borderRadius: "50%", background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)", color: "#fff",
              fontSize: 18, cursor: "pointer", zIndex: 99999,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
                style={{ position: "fixed", left: 18, top: "50%", transform: "translateY(-50%)", width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); }}
                style={{ position: "fixed", right: 18, top: "50%", transform: "translateY(-50%)", width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 22, cursor: "pointer", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center" }}
              >›</button>
            </>
          )}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "min(500px,88vw)", maxHeight: "88vh", borderRadius: 20, overflow: "hidden", boxShadow: "0 60px 160px rgba(0,0,0,0.95)" }}
          >
            <img src={getImageUrl(images[imgIdx])} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", maxHeight: "88vh", display: "block" }} />
          </div>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {showCancel && order && (
        <CancelModal
          order={order}
          onConfirm={handleCancelConfirm}
          onClose={() => setShowCancel(false)}
          loading={cancelLoad}
        />
      )}

      <div>
        {/* ── Back + Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/admin/orders")}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 14px", borderRadius: 11,
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to Orders
          </button>

          <div style={{ flex: 1 }}>
            <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: "-0.3px" }}>
              Order <span style={{ color: "#a78bfa", fontFamily: "monospace" }}>#{orderId}</span>
            </h1>
            {!loading && order && (
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "3px 0 0" }}>
                Placed on {fmtDate(order.createdAt)}
              </p>
            )}
          </div>

          {!loading && order && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {showPrintBill && (
                <button
                  onClick={() => printBill(order)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 16px", borderRadius: 12,
                    background: "rgba(59,130,246,0.15)", color: "#93c5fd",
                    border: "1px solid rgba(59,130,246,0.3)", cursor: "pointer",
                    fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(59,130,246,0.25)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(59,130,246,0.15)"}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/>
                  </svg>
                  Print Bill
                </button>
              )}

              {canCancel && (
                <button
                  onClick={() => setShowCancel(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 16px", borderRadius: 12,
                    background: "rgba(239,68,68,0.12)", color: "#fca5a5",
                    border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer",
                    fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.22)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Cancel Order
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[280, 220, 260].map((h, i) => (
              <div key={i} style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <Skeleton w="120px" h="14px" />
                <Skeleton w="100%" h={h} />
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div style={{ padding: 60, textAlign: "center", color: "#fca5a5", fontSize: 14 }}>{error}</div>
        )}

        {/* ── Content ── */}
        {!loading && order && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* 1. Order Details */}
            <SectionCard title="Order Details" icon="📋" className="od-section">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 0 }}>
                <div>
                  <InfoRow label="Order ID"       value={`#${order.orderId}`} mono accent="#a78bfa" />
                  <InfoRow label="Order State"    value={<StatusBadge status={order.orderState}    styles={ORDER_STATUS_STYLES} />} />
                  <InfoRow label="Payment Status" value={<StatusBadge status={order.paymentStatus} styles={PAY_STATUS_STYLES} />} />
                  <InfoRow label="Payment Method" value={PAY_METHOD_LABEL[order.payMethod] || order.paymentMode || "—"} />
                </div>
                <div style={{ paddingLeft: 20 }}>
                  <InfoRow label="Placed On" value={fmtDate(order.createdAt)} />
                  <InfoRow label="Size"      value={order.size?.toUpperCase() || "—"} accent="#c4b5fd" />
                  <InfoRow label="Quantity"  value={order.quantity ?? "—"} accent="#fbbf24" />
                  {order.cancellationReason && (
                    <InfoRow label="Cancel Reason" value={order.cancellationReason} accent="#fca5a5" />
                  )}
                  {order.cancelledAt && (
                    <InfoRow label="Cancelled At" value={fmtDate(order.cancelledAt)} />
                  )}
                </div>
              </div>
            </SectionCard>

            {/* 2. Customer Details */}
            <SectionCard title="Customer Details" icon="👤" className="od-section">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 0 }}>
                <div>
                  <InfoRow label="Customer ID"     value={order.customer?.customerId}  mono accent="#a78bfa" />
                  <InfoRow label="Username"         value={order.customer?.username}     accent="#fff" />
                  <InfoRow label="Email"            value={order.customer?.email} />
                  <InfoRow label="Mobile"           value={order.customer?.phone   || "—"} accent="#fbbf24" />
                  <InfoRow label="Alternate Mobile" value={order.customer?.altPhone || "—"} />
                  {order.customer?.gender && (
                    <InfoRow label="Gender" value={order.customer.gender} />
                  )}
                </div>
                <div style={{ paddingLeft: 20 }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
                    Delivery Address
                  </p>
                  {addrParts.length > 0 ? (
                    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", padding: "12px 14px" }}>
                      <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                        {addrParts.join(", ")}
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>No address on file</p>
                  )}

                  {/* Ship button — fires notification on success */}
                  {isConfirmed && (
                    <button
                      onClick={() => handleShip()}
                      disabled={actionLoad}
                      style={{
                        marginTop: 16, width: "100%", padding: "13px 20px", borderRadius: 14,
                        fontSize: 13, fontWeight: 800,
                        background: actionLoad ? "rgba(6,182,212,0.1)" : "linear-gradient(135deg,rgba(6,182,212,0.25),rgba(6,182,212,0.12))",
                        color: "#67e8f9", border: "1px solid rgba(6,182,212,0.4)",
                        cursor: actionLoad ? "not-allowed" : "pointer", opacity: actionLoad ? 0.7 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "all 0.15s", boxShadow: "0 4px 20px rgba(6,182,212,0.12)",
                      }}
                      onMouseEnter={e => { if (!actionLoad) e.currentTarget.style.background = "linear-gradient(135deg,rgba(6,182,212,0.35),rgba(6,182,212,0.2))"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = actionLoad ? "rgba(6,182,212,0.1)" : "linear-gradient(135deg,rgba(6,182,212,0.25),rgba(6,182,212,0.12))"; }}
                    >
                      {actionLoad ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                            <path d="M21 12a9 9 0 11-6.22-8.56"/>
                          </svg>
                          Updating…
                        </>
                      ) : (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/>
                            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                          </svg>
                          Ship to Delivery Boy
                        </>
                      )}
                    </button>
                  )}

                  {/* Cancel shipment button — fires notification on success */}
                  {isShipped && (
                    <button
                      onClick={handleCancelShip}
                      disabled={actionLoad}
                      style={{
                        marginTop: 16, width: "100%", padding: "13px 20px", borderRadius: 14,
                        fontSize: 13, fontWeight: 800,
                        background: actionLoad ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.12)",
                        color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)",
                        cursor: actionLoad ? "not-allowed" : "pointer", opacity: actionLoad ? 0.7 : 1,
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { if (!actionLoad) e.currentTarget.style.background = "rgba(239,68,68,0.22)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; }}
                    >
                      {actionLoad ? "Updating…" : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                          </svg>
                          Cancel Shipment (→ Confirmed)
                        </>
                      )}
                    </button>
                  )}

                  {isDone && (
                    <div style={{
                      marginTop: 16, padding: "12px 16px", borderRadius: 12,
                      background: order.orderState === "CANCELLED" ? "rgba(239,68,68,0.07)" : "rgba(34,197,94,0.07)",
                      border: `1px solid ${order.orderState === "CANCELLED" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                      color: order.orderState === "CANCELLED" ? "#fca5a5" : "#86efac",
                      fontSize: 12, fontWeight: 700, textAlign: "center",
                    }}>
                      {order.orderState === "CANCELLED" ? "⚠ Order has been cancelled" : "✓ Order delivered successfully"}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* 3. Product Details */}
            <SectionCard title="Product Details" icon="🛍️" className="od-section">
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {images.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                    <div
                      onClick={() => setLightbox(true)}
                      style={{
                        width: 150, height: 195, borderRadius: 16, overflow: "hidden",
                        background: "rgba(255,255,255,0.06)", cursor: "zoom-in",
                        border: "1px solid rgba(139,92,246,0.3)",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        flexShrink: 0, position: "relative",
                      }}
                    >
                      <img
                        src={getImageUrl(images[imgIdx])}
                        alt="product"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <div style={{
                        position: "absolute", bottom: 8, right: 8,
                        background: "rgba(0,0,0,0.55)", borderRadius: 8,
                        padding: "3px 7px", fontSize: 9, color: "rgba(255,255,255,0.7)", fontWeight: 700,
                      }}>
                        🔍 Zoom
                      </div>
                    </div>
                    {images.length > 1 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: 150 }}>
                        {images.map((img, i) => (
                          <div
                            key={i}
                            className={`od-img-thumb ${i === imgIdx ? "active" : ""}`}
                            onClick={() => setImgIdx(i)}
                            style={{ width: 38, height: 48 }}
                          >
                            <img src={getImageUrl(img)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 220 }}>
                  <p style={{ color: "#fff", fontWeight: 900, fontSize: 17, margin: "0 0 2px", lineHeight: 1.3 }}>
                    {order.product?.productName || "—"}
                  </p>
                  <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, margin: "0 0 14px", fontFamily: "monospace" }}>
                    {order.product?.productId}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {order.product?.category && (
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "rgba(139,92,246,0.15)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.25)" }}>
                        {order.product.category}
                      </span>
                    )}
                    {order.product?.subCategory && (
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {order.product.subCategory}
                      </span>
                    )}
                    {order.product?.status && (
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "rgba(34,197,94,0.12)", color: "#86efac", border: "1px solid rgba(34,197,94,0.25)" }}>
                        {order.product.status}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 8, marginBottom: 16 }}>
                    {order.size && (
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 3px" }}>Size</p>
                        <p style={{ color: "#c4b5fd", fontSize: 15, fontWeight: 900, margin: 0 }}>{order.size.toUpperCase()}</p>
                      </div>
                    )}
                    {order.quantity && (
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 3px" }}>Quantity</p>
                        <p style={{ color: "#fbbf24", fontSize: 15, fontWeight: 900, margin: 0 }}>{order.quantity}</p>
                      </div>
                    )}
                    {order.product?.productColor?.name && (
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "8px 12px", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 5px" }}>Colour</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 14, height: 14, borderRadius: "50%", background: order.product.productColor.hex || "#888", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }} />
                          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 700, margin: 0 }}>{order.product.productColor.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ padding: "8px 14px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>
                        Pricing Breakdown
                      </p>
                    </div>
                    <div style={{ padding: "6px 14px" }}>
                      <InfoRow label="MRP / Unit Price"     value={`₹${fmt(price)}`} />
                      {discount > 0 && (
                        <InfoRow label={`Discount (${discount}%)`} value={`− ₹${fmt(price - finalPrice)}`} accent="#4ade80" />
                      )}
                      <InfoRow label="Price After Discount" value={`₹${fmt(finalPrice)}`} accent="#fbbf24" />
                      <InfoRow label="Quantity"             value={`× ${qty}`} />
                      <InfoRow label="Item Total"           value={`₹${fmt(finalPrice * qty)}`} accent="#fbbf24" />
                      <InfoRow label="Delivery Charge"      value={delivery === 0 ? "FREE" : `₹${fmt(delivery)}`} accent={delivery === 0 ? "#4ade80" : undefined} />
                      <InfoRow label="Platform Charge"      value="₹0" accent="#4ade80" />
                    </div>
                    <div style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "12px 14px",
                      background: "rgba(139,92,246,0.08)",
                      borderTop: "1px solid rgba(139,92,246,0.15)",
                    }}>
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>Total Amount</span>
                      <span style={{ color: "#fbbf24", fontSize: 20, fontWeight: 900 }}>₹{fmt(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

          </div>
        )}
      </div>
    </>
  );
}