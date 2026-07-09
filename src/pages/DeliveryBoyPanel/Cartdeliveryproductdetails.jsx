// CartDeliveryProductDetails.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { ImCross } from "react-icons/im";
import { IoSend } from "react-icons/io5";
import { API } from "../../api";
import paymentQr from "../../assets/images/payment/payment-receive-qr.png";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8008";
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

const PAY_METHOD_LABEL = { COD: "Cash on Delivery", CARD: "Card", UPI: "UPI" };

// ─── QR code image used for the "Pay Online" modal ────────────────────────────
const PAYMENT_QR_IMAGE = paymentQr;

const openGoogleMaps = (lat, lng) =>
  window.open(`https://www.google.com/maps?q=${lat},${lng}&z=17&hl=en`, "_blank", "noopener,noreferrer");

// ─── Status configs ───────────────────────────────────────────────────────────
const ORDER_STATUS_STYLES = {
  PLACED:    { bg: "rgba(139,92,246,0.12)", color: "#c4b5fd", border: "rgba(139,92,246,0.35)", dot: "#a78bfa" },
  CONFIRMED: { bg: "rgba(59,130,246,0.12)",  color: "#93c5fd", border: "rgba(59,130,246,0.35)",  dot: "#60a5fa" },
  SHIPPED:   { bg: "rgba(6,182,212,0.12)",   color: "#67e8f9", border: "rgba(6,182,212,0.35)",   dot: "#22d3ee" },
  DELIVERED: { bg: "rgba(34,197,94,0.12)",   color: "#86efac", border: "rgba(34,197,94,0.35)",   dot: "#4ade80" },
  CANCELLED: { bg: "rgba(239,68,68,0.12)",   color: "#fca5a5", border: "rgba(239,68,68,0.35)",   dot: "#f87171" },
  RETURNED:  { bg: "rgba(251,191,36,0.12)",  color: "#fde68a", border: "rgba(251,191,36,0.35)",  dot: "#fbbf24" },
};

const PAY_STATUS_STYLES = {
  PENDING: { bg: "rgba(234,179,8,0.12)",  color: "#fde68a", border: "rgba(234,179,8,0.3)"  },
  PAID:    { bg: "rgba(34,197,94,0.12)",  color: "#86efac", border: "rgba(34,197,94,0.3)"  },
  FAILED:  { bg: "rgba(239,68,68,0.12)",  color: "#fca5a5", border: "rgba(239,68,68,0.3)"  },
};

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
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
        <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{title}</span>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value, accent, mono }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600 }}>{label}</span>
      <span style={{
        color: accent || "rgba(255,255,255,0.82)", fontSize: 13,
        fontWeight: accent ? 700 : 500,
        fontFamily: mono ? "monospace" : "inherit",
        textAlign: "right", maxWidth: "60%",
      }}>{value ?? "—"}</span>
    </div>
  );
}

function Skeleton({ w, h, radius = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
      backgroundSize: "600px 100%", animation: "skShimmer 1.4s infinite linear",
    }} />
  );
}

// ─── Payment Method Dropdown (Offline / Online) ───────────────────────────────
function PaymentMethodDropdown({ value, onChange }) {
  const isOnline = value === "ONLINE";
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title="Choose how this order will be paid for"
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          padding: "9px 32px 9px 14px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          outline: "none",
          whiteSpace: "nowrap",
          background: isOnline ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.06)",
          color: isOnline ? "#4ade80" : "rgba(255,255,255,0.65)",
          border: `1px solid ${isOnline ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.12)"}`,
          transition: "all 0.15s",
        }}
      >
        <option value="OFFLINE" style={{ background: "#0f0f14", color: "#fff" }}>
          💵 Cash on Delivery
        </option>
        <option value="ONLINE" style={{ background: "#0f0f14", color: "#fff" }}>
          📲 Pay Online (UPI/QR)
        </option>
      </select>
      <svg
        width="10" height="10" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="3"
        style={{
          position: "absolute", right: 11, top: "50%",
          transform: "translateY(-50%)", pointerEvents: "none",
          color: isOnline ? "#4ade80" : "rgba(255,255,255,0.4)",
        }}
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

// ─── QR Payment Modal (shown when "Pay Online" is selected) ──────────────────
function QRPaymentModal({ order, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          borderRadius: 24, padding: 22, width: "100%", maxWidth: 340,
          background: "#0f0f14", border: "1px solid rgba(34,197,94,0.28)",
          boxShadow: "0 50px 120px rgba(0,0,0,0.95)",
          animation: "fadeIn 0.25s ease both",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 800, margin: 0 }}>Scan &amp; Pay</h3>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, margin: "3px 0 0" }}>
              #{order.cartOrderId}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.6)", fontSize: 13, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* QR code image — exact uploaded QR */}
        <div style={{
          borderRadius: 18, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        }}>
          <img
            src={PAYMENT_QR_IMAGE}
            alt="Scan to pay via UPI"
            style={{ width: "100%", display: "block" }}
          />
        </div>

        <div style={{
          marginTop: 14, padding: "10px 14px", borderRadius: 12,
          background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.28)",
          color: "#fde68a", fontSize: 11, fontWeight: 600, lineHeight: 1.5,
        }}>
          Amount payable for this order: <b>₹{fmt(Number(order.totalPrice || 0))}</b>. Have the customer scan and pay this amount before confirming delivery.
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%", marginTop: 14, padding: "12px", borderRadius: 12,
            fontSize: 13, fontWeight: 700,
            background: "rgba(34,197,94,0.16)", color: "#4ade80",
            border: "1px solid rgba(34,197,94,0.35)", cursor: "pointer",
          }}
        >Done</button>
      </div>
    </div>
  );
}

// ─── Delivery Address Block ───────────────────────────────────────────────────
function DeliveryAddressBlock({ deliveryAddress }) {
  const parts = [
    deliveryAddress?.addressLine1, deliveryAddress?.addressLine2,
    deliveryAddress?.city, deliveryAddress?.district,
    deliveryAddress?.state, deliveryAddress?.pincode, deliveryAddress?.country,
  ].filter(Boolean);

  const hasLocation = deliveryAddress?.location?.lat && deliveryAddress?.location?.lng;

  return (
    <div>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
        Delivery Address
      </p>
      {parts.length > 0 ? (
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", padding: "12px 14px" }}>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            {parts.join(", ")}
          </p>
          {hasLocation ? (
            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => openGoogleMaps(deliveryAddress.location.lat, deliveryAddress.location.lng)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 13px", borderRadius: 10, fontSize: 11, fontWeight: 800,
                  background: "rgba(34,197,94,0.12)", color: "#4ade80",
                  border: "1px solid rgba(34,197,94,0.32)", cursor: "pointer",
                  transition: "background 0.15s, transform 0.12s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,197,94,0.22)"; e.currentTarget.style.transform = "scale(1.04)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,197,94,0.12)"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Track Location
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" style={{ opacity: 0.6 }}>
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>No GPS pin set by customer</span>
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>No address on file</p>
      )}
    </div>
  );
}

// ─── 6-Digit OTP Input ────────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const refs = useRef(Array.from({ length: 6 }, () => React.createRef()));

  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const chars = value.split("");
    chars[i] = v.slice(-1);
    onChange([...chars].join(""));
    if (v && i < 5) refs.current[i + 1]?.current?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !value[i] && i > 0) refs.current[i - 1]?.current?.focus();
    if (e.key === "ArrowLeft"  && i > 0)             refs.current[i - 1]?.current?.focus();
    if (e.key === "ArrowRight" && i < 5)             refs.current[i + 1]?.current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.current?.focus();
  };

  return (
    <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 10 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i} ref={refs.current[i]}
          type="text" inputMode="numeric" maxLength={1}
          value={value[i] || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: "100%", aspectRatio: "1 / 1.15", minHeight: 54,
            borderRadius: 14, textAlign: "center",
            fontSize: 24, fontWeight: 900, fontFamily: "monospace", outline: "none",
            background: value[i] ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.04)",
            border:     value[i] ? "2px solid rgba(6,182,212,0.55)" : "2px solid rgba(255,255,255,0.1)",
            color:      value[i] ? "#67e8f9" : "rgba(255,255,255,0.4)",
            transition: "all 0.15s",
            cursor: disabled ? "not-allowed" : "text", opacity: disabled ? 0.6 : 1,
            caretColor: "#67e8f9", boxShadow: value[i] ? "0 0 16px rgba(6,182,212,0.18)" : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Delivery Failed Reason Modal ─────────────────────────────────────────────
const DELIVERY_FAIL_REASONS = [
  "Customer not available", "Wrong address",
  "Customer refused delivery", "Access to location denied",
  "Item damaged in transit", "Other",
];

function DeliveryFailedModal({ onConfirm, onClose, loading }) {
  const [reason, setReason] = useState(DELIVERY_FAIL_REASONS[0]);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)" }}>
      <div style={{ borderRadius: 22, padding: 28, width: "100%", maxWidth: 400, background: "#0f0f14", border: "1px solid rgba(239,68,68,0.28)", boxShadow: "0 50px 120px rgba(0,0,0,0.95)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚠️</div>
          <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 800, margin: 0 }}>Delivery Failed</h3>
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "0 0 20px 46px" }}>Select the reason for failed delivery</p>
        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>Reason</label>
        <select value={reason} onChange={e => setReason(e.target.value)}
          style={{ width: "100%", borderRadius: 12, padding: "11px 14px", fontSize: 13, marginBottom: 22, outline: "none", boxSizing: "border-box", background: "#07070A", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", appearance: "none" }}>
          {DELIVERY_FAIL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>Back</button>
          <button onClick={() => onConfirm(reason)} disabled={loading} style={{ flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700, background: "rgba(239,68,68,0.18)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.35)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delivery Code Panel (cart order version) ─────────────────────────────────
// Uses /cart/updateCartOrderStatus for status changes
function CartDeliveryCodePanel({ order, onDelivered, onDeliveryFailed }) {
  const [codeSent,        setCodeSent]        = useState(false);
  const [sendLoading,     setSendLoading]     = useState(false);
  const [otp,             setOtp]             = useState("");
  const [verifying,       setVerifying]       = useState(false);
  const [verified,        setVerified]        = useState(false);
  const [verifyError,     setVerifyError]     = useState("");
  const [actionLoad,      setActionLoad]      = useState(false);
  const [showFailModal,   setShowFailModal]   = useState(false);
  const [failLoad,        setFailLoad]        = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [floatingCharges, setFloatingCharges] = useState([]);

  const delivery = Number(order?.deliveryCharge || 0);

  const handleSendCode = async () => {
    setSendLoading(true);
    setVerifyError("");
    try {
      const res = await API.post(`/delivery/sendDeliveryCode/${order.cartOrderId}`);
      if (res.data.success) {
        setCodeSent(true);
      } else {
        setVerifyError(res.data.message || "Failed to send code");
      }
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Failed to send delivery code");
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) { setVerifyError("Please enter a valid 6-digit code"); return; }
    setVerifyError("");
    setVerifying(true);
    try {
      const res = await API.post(`/delivery/verifyDeliveryCode/${order.cartOrderId}`, { code: otp });
      if (res.data.success) {
        setVerified(true);
      } else {
        setVerifyError(res.data.message || "Invalid code");
        setOtp("");
      }
    } catch (err) {
      setVerifyError(err.response?.data?.message || "Verification failed");
      setOtp("");
    } finally {
      setVerifying(false);
    }
  };

  const handleDelivered = async () => {
    setActionLoad(true);
    try {
      const res = await API.put(`/cart/updateCartOrderStatus/${order.cartOrderId}`, { orderState: "DELIVERED" });
      if (res.data.success) {
        setShowCelebration(true);
        const charges = Array.from({ length: 6 }, (_, i) => ({
          id: Date.now() + i,
          x: 30 + Math.random() * 40,
          delay: i * 0.18,
          rotate: -15 + Math.random() * 30,
        }));
        setFloatingCharges(charges);
        setTimeout(() => {
          setShowCelebration(false);
          setFloatingCharges([]);
          onDelivered();
        }, 3200);
      }
    } catch (err) {
      console.error("markDelivered error", err);
    } finally {
      setActionLoad(false);
    }
  };

  const handleFailConfirm = async (reason) => {
    setFailLoad(true);
    try {
      await onDeliveryFailed(reason);
      setShowFailModal(false);
    } finally {
      setFailLoad(false);
    }
  };

  return (
    <>
      {showFailModal && (
        <DeliveryFailedModal onConfirm={handleFailConfirm} onClose={() => setShowFailModal(false)} loading={failLoad} />
      )}

      {/* Celebration overlay */}
      {showCelebration && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99990, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)", pointerEvents: "none" }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute", left: `${5 + Math.random() * 90}%`, top: `-${10 + Math.random() * 20}px`,
              width: `${6 + Math.random() * 10}px`, height: `${6 + Math.random() * 10}px`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              background: ["#4ade80","#fbbf24","#a78bfa","#67e8f9","#f472b6","#fb923c"][i % 6],
              animation: `confettiFall ${1.2 + Math.random() * 1.4}s ${Math.random() * 0.5}s ease-in forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }} />
          ))}
          {floatingCharges.map(fc => (
            <div key={fc.id} style={{
              position: "absolute", left: `${fc.x}%`, bottom: "20%",
              animation: `floatUp 2.8s ${fc.delay}s ease-out forwards`,
              transform: `rotate(${fc.rotate}deg)`,
              background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.5)",
              borderRadius: 12, padding: "6px 14px",
              color: "#4ade80", fontSize: 14, fontWeight: 900, whiteSpace: "nowrap", pointerEvents: "none",
            }}>
              +₹{fmt(delivery)} Delivery
            </div>
          ))}
          <div style={{ textAlign: "center", animation: "celebrationPop 0.5s cubic-bezier(0.34,1.52,0.64,1) both" }}>
            <div style={{ fontSize: 72, marginBottom: 12, filter: "drop-shadow(0 0 30px rgba(74,222,128,0.6))" }}>🎉</div>
            <div style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 6, textShadow: "0 0 40px rgba(74,222,128,0.5)" }}>Delivered Successfully!</div>
            <div style={{ color: "#4ade80", fontSize: 15, fontWeight: 700 }}>₹{fmt(delivery)} delivery charge earned ↑</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {!codeSent ? (
          <button
            onClick={handleSendCode}
            disabled={sendLoading}
            style={{
              width: "100%", padding: "13px 20px", borderRadius: 14,
              fontSize: 13, fontWeight: 800,
              background: sendLoading ? "rgba(6,182,212,0.08)" : "linear-gradient(135deg,rgba(6,182,212,0.25),rgba(6,182,212,0.12))",
              color: "#67e8f9", border: "1px solid rgba(6,182,212,0.4)",
              cursor: sendLoading ? "not-allowed" : "pointer", opacity: sendLoading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.15s", boxShadow: "0 4px 20px rgba(6,182,212,0.12)",
            }}
          >
            {sendLoading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.22-8.56"/>
                </svg>
                Sending Code…
              </>
            ) : (
              <><IoSend /> Send Delivery Code to Customer</>
            )}
          </button>
        ) : !verified ? (
          <div style={{
            width: "100%", maxWidth: 460, margin: "0 auto",
            background: "linear-gradient(180deg,rgba(10,25,40,0.96) 0%,rgba(8,18,32,0.98) 100%)",
            border: "1px solid rgba(6,182,212,0.22)", borderRadius: 24,
            padding: "22px 20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.03)",
            animation: "fadeIn 0.3s ease both", backdropFilter: "blur(18px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <div style={{ minWidth: 42, width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,rgba(6,182,212,0.25),rgba(6,182,212,0.1))", border: "1px solid rgba(6,182,212,0.45)", display: "flex", alignItems: "center", justifyContent: "center", color: "#67e8f9", fontSize: 20, boxShadow: "0 0 20px rgba(6,182,212,0.18)" }}>
                <MdOutlineVerifiedUser />
              </div>
              <div>
                <p style={{ color: "#67e8f9", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>Code sent to customer</p>
                <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>Enter the 6-digit delivery verification code</p>
              </div>
            </div>
            <OTPInput value={otp} onChange={setOtp} disabled={verifying} />
            {verifyError && (
              <p style={{ color: "#fca5a5", fontSize: 12, fontWeight: 700, textAlign: "center", marginTop: 16, animation: "shake 0.3s ease" }}>{verifyError}</p>
            )}
            <button
              onClick={handleVerify}
              disabled={verifying || otp.length < 6}
              style={{
                width: "100%", marginTop: 22, padding: "14px", borderRadius: 16,
                fontSize: 15, fontWeight: 800,
                background:    otp.length === 6 ? "linear-gradient(135deg,rgba(6,182,212,0.38),rgba(6,182,212,0.18))" : "rgba(255,255,255,0.04)",
                color:         otp.length === 6 ? "#67e8f9" : "rgba(255,255,255,0.25)",
                border: `1px solid ${otp.length === 6 ? "rgba(6,182,212,0.45)" : "rgba(255,255,255,0.07)"}`,
                cursor: verifying || otp.length < 6 ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: otp.length === 6 ? "0 10px 30px rgba(6,182,212,0.15)" : "none",
              }}
            >
              {verifying ? "Verifying..." : "Verify Code"}
            </button>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.3s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, marginBottom: 14, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</div>
              <div>
                <p style={{ color: "#4ade80", fontSize: 12, fontWeight: 800, margin: 0 }}>Code Verified Successfully</p>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, margin: 0 }}>Mark the delivery outcome below</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                onClick={handleDelivered}
                disabled={actionLoad}
                style={{
                  padding: "14px 12px", borderRadius: 14, fontSize: 13, fontWeight: 800,
                  background: actionLoad ? "rgba(34,197,94,0.08)" : "linear-gradient(135deg,rgba(34,197,94,0.28),rgba(34,197,94,0.12))",
                  color: "#4ade80", border: "1px solid rgba(34,197,94,0.45)",
                  cursor: actionLoad ? "not-allowed" : "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.15s", boxShadow: "0 4px 20px rgba(34,197,94,0.1)",
                }}
              >
                <span style={{ fontSize: 22 }}><TbTruckDelivery /></span>
                <span>Mark As Delivered</span>
              </button>
              <button
                onClick={() => setShowFailModal(true)}
                disabled={actionLoad}
                style={{
                  padding: "14px 12px", borderRadius: 14, fontSize: 13, fontWeight: 800,
                  background: "rgba(239,68,68,0.1)", color: "#fca5a5",
                  border: "1px solid rgba(239,68,68,0.3)",
                  cursor: actionLoad ? "not-allowed" : "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 22 }}><ImCross /></span>
                <span>Delivery Failed</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Cart Items Table ─────────────────────────────────────────────────────────
function CartItemsTable({ items }) {
  const [expandedImg, setExpandedImg] = useState(null);

  if (!items || items.length === 0) return (
    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No items found.</p>
  );

  return (
    <>
      {/* Lightbox */}
      {expandedImg && (
        <div onClick={() => setExpandedImg(null)} style={{ position: "fixed", inset: 0, zIndex: 99998, background: "rgba(0,0,0,0.95)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <div style={{ maxWidth: "min(500px,88vw)", maxHeight: "88vh", borderRadius: 20, overflow: "hidden" }}>
            <img src={expandedImg} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", maxHeight: "88vh", display: "block" }} />
          </div>
          <button onClick={() => setExpandedImg(null)} style={{ position: "fixed", top: 18, right: 18, width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, idx) => {
          const img = item.productImage ? getImageUrl(item.productImage) : null;
          const saving = item.mrp && item.unitPrice ? (item.mrp - item.unitPrice) * item.quantity : 0;

          return (
            <div key={idx} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              padding: "14px 16px", borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.055)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
            >
              {/* Thumbnail */}
              <div
                onClick={() => img && setExpandedImg(img)}
                style={{
                  width: 58, height: 74, borderRadius: 10, overflow: "hidden", flexShrink: 0,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: img ? "zoom-in" : "default",
                }}
              >
                {img ? (
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 14, margin: 0, flex: 1 }}>
                    {item.productName || "—"}
                  </p>
                  <p style={{ color: "#fbbf24", fontWeight: 800, fontSize: 15, margin: 0, whiteSpace: "nowrap" }}>
                    ₹{fmt(item.lineTotal)}
                  </p>
                </div>

                <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace", fontSize: 11, margin: "2px 0 8px" }}>
                  {item.productId}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {item.size && (
                    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "rgba(139,92,246,0.12)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.22)" }}>
                      Size: {item.size.toUpperCase()}
                    </span>
                  )}
                  <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
                    Qty: {item.quantity}
                  </span>
                  {item.discount > 0 && (
                    <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: "rgba(34,197,94,0.1)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" }}>
                      {item.discount}% off
                    </span>
                  )}
                </div>

                {/* Unit pricing hint */}
                <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  {item.mrp && item.mrp !== item.unitPrice && (
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", textDecoration: "line-through" }}>
                      MRP ₹{fmt(item.mrp)}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                    Unit ₹{fmt(item.unitPrice)} × {item.quantity}
                  </span>
                  {saving > 0 && (
                    <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>
                      Save ₹{fmt(saving)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Print Bill for cart order ────────────────────────────────────────────────
function printCartBill(order) {
  const { customer, deliveryAddress, items = [] } = order;

  const addrParts = [
    deliveryAddress?.addressLine1, deliveryAddress?.addressLine2,
    deliveryAddress?.city, deliveryAddress?.district,
    deliveryAddress?.state, deliveryAddress?.pincode, deliveryAddress?.country,
  ].filter(Boolean);

  const subtotal       = Number(order.subtotal       || 0);
  const totalDiscount  = Number(order.totalDiscount  || 0);
  const voucherDiscount= Number(order.voucherDiscount|| 0);
  const deliveryCharge = Number(order.deliveryCharge || 0);
  const totalPrice     = Number(order.totalPrice     || 0);

  const payMethodDisplay = PAY_METHOD_LABEL[order.payMethod] || order.payMethod || "—";

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:8px 10px;border-bottom:1px solid #f0ebe2;">${item.productName || "—"}${item.size ? ` <span style="font-size:10px;color:#aaa;">(${item.size.toUpperCase()})</span>` : ""}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0ebe2;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0ebe2;text-align:right;">₹${fmt(item.mrp)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0ebe2;text-align:right;color:#16a34a;">${item.discount > 0 ? `${item.discount}%` : "—"}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0ebe2;text-align:right;">₹${fmt(item.unitPrice)}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #f0ebe2;text-align:right;font-weight:700;">₹${fmt(item.lineTotal)}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice – ${order.cartOrderId}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'DM Sans',sans-serif; background:#fff; color:#1a1a1a; font-size:13px; }
  .page { max-width:720px; margin:0 auto; padding:32px 30px; }
  .header { display:flex; justify-content:space-between; align-items:center; padding-bottom:22px; border-bottom:1.5px solid #e8e2d4; margin-bottom:24px; }
  .brand-name { font-family:'Playfair Display',serif; font-size:19px; font-weight:900; color:#0d1117; letter-spacing:0.04em; text-transform:uppercase; }
  .brand-sub { font-size:9px; color:#9a8a6a; letter-spacing:0.18em; text-transform:uppercase; font-weight:600; margin-top:2px; }
  .inv-label { font-size:9px; color:#aaa; text-transform:uppercase; letter-spacing:0.12em; font-weight:600; }
  .inv-id { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#0d1117; margin:2px 0; }
  .inv-date { font-size:11px; color:#888; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
  .info-block { background:#faf9f6; border-radius:12px; padding:14px 16px; border:1px solid #ede8df; }
  .info-label { font-size:9px; text-transform:uppercase; letter-spacing:0.13em; color:#b09a7a; font-weight:700; margin-bottom:9px; padding-bottom:7px; border-bottom:1px solid #ede8df; }
  .info-block p { font-size:12px; color:#333; line-height:1.7; }
  table { width:100%; border-collapse:collapse; border:1px solid #ede8df; border-radius:12px; overflow:hidden; margin-bottom:20px; }
  thead tr { background:#0d1117; }
  thead th { padding:9px 10px; font-size:9px; text-transform:uppercase; letter-spacing:0.1em; color:#c9b99a; font-weight:700; text-align:left; }
  thead th:not(:first-child) { text-align:right; }
  thead th:nth-child(2) { text-align:center; }
  .totals-table { width:100%; border-collapse:collapse; margin-bottom:20px; }
  .totals-table td { padding:7px 10px; font-size:12px; }
  .totals-table tr:not(:last-child) td { border-bottom:1px solid #f0ebe2; }
  .grand-total td { background:#0d1117; color:#f5f0e8; font-size:14px; font-weight:800; padding:12px 10px; }
  .grand-total td:last-child { font-family:'Playfair Display',serif; font-size:16px; color:#c9b99a; text-align:right; }
  .pill { display:inline-block; padding:3px 9px; border-radius:20px; font-size:9px; font-weight:700; background:#ede8df; color:#6b5a3e; }
  .footer { border-top:1.5px solid #e8e2d4; padding-top:18px; display:flex; justify-content:space-between; align-items:flex-end; }
  .footer-note { font-size:10px; color:#bbb; text-align:right; line-height:1.6; }
  @media print { body { print-color-adjust:exact; -webkit-print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand-name">Midnight Aura</div>
      <div class="brand-sub">Premium Fashion · Cart Invoice</div>
    </div>
    <div style="text-align:right;">
      <div class="inv-label">Cart Order ID</div>
      <div class="inv-id">#${order.cartOrderId}</div>
      <div class="inv-date">${fmtDate(order.createdAt)}</div>
    </div>
  </div>

  <div class="grid2">
    <div class="info-block">
      <div class="info-label">Customer Details</div>
      <p><strong>${customer?.username || "—"}</strong></p>
      <p style="font-size:11px;color:#888;">ID: ${customer?.customerId || "—"}</p>
      <p>${customer?.email || "—"}</p>
      <p>📞 ${customer?.phone || "—"}</p>
    </div>
    <div class="info-block">
      <div class="info-label">Delivery Address</div>
      <p>${addrParts.join(", ") || "Not provided"}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">MRP</th>
        <th style="text-align:right;">Disc.</th>
        <th style="text-align:right;">Unit Price</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <table class="totals-table">
    <tr><td>Subtotal (MRP)</td><td style="text-align:right;">₹${fmt(subtotal + totalDiscount)}</td></tr>
    ${totalDiscount > 0 ? `<tr><td style="color:#16a34a;">Product Discount</td><td style="text-align:right;color:#16a34a;">− ₹${fmt(totalDiscount)}</td></tr>` : ""}
    ${voucherDiscount > 0 ? `<tr><td style="color:#16a34a;">Voucher Discount</td><td style="text-align:right;color:#16a34a;">− ₹${fmt(voucherDiscount)}</td></tr>` : ""}
    <tr><td>Delivery Charge</td><td style="text-align:right;">${deliveryCharge === 0 ? "FREE" : "₹" + fmt(deliveryCharge)}</td></tr>
    <tr><td>Platform Charge</td><td style="text-align:right;color:#16a34a;">₹0</td></tr>
    <tr class="grand-total"><td>Total Amount Payable</td><td>₹${fmt(totalPrice)}</td></tr>
  </table>

  <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
    <div class="info-block" style="flex:1;">
      <div class="info-label">Payment</div>
      <p><strong>${payMethodDisplay}</strong></p>
      <p style="font-size:11px;">Status: <strong>${order.paymentStatus || "—"}</strong></p>
    </div>
    <div class="info-block" style="flex:1;">
      <div class="info-label">Order Status</div>
      <p><strong>${order.orderState || "—"}</strong></p>
      <p style="font-size:11px;">Items: ${items.length}</p>
    </div>
  </div>

  <div class="footer">
    <div>
      <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:#0d1117;">Midnight Aura</div>
      <div style="font-size:10px;color:#aaa;margin-top:2px;">Thank you for shopping with us ✨</div>
    </div>
    <div class="footer-note">Computer-generated invoice.<br/>No signature required.</div>
  </div>
</div>
</body>
</html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CartDeliveryProductDetails() {
  const { cartOrderId } = useParams();
  const navigate        = useNavigate();

  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [toast,      setToast]      = useState(null);
  const toastRef = useRef(null);

  // ── Payment method (Offline = Cash on Delivery, Online = UPI/QR) ──
  const [paymentMethod, setPaymentMethod] = useState("OFFLINE");
  const [showQRModal,   setShowQRModal]   = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3200);
  };

  // ── Fetch cart order ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await API.get(`/cart/getCartOrderById/${cartOrderId}`);
        if (res.data.success) setOrder(res.data.data);
        else setError("Cart order not found.");
      } catch (err) {
        console.error("getCartOrderById error", err);
        setError("Failed to load cart order.");
      } finally {
        setLoading(false);
      }
    })();
  }, [cartOrderId]);

  const handleDelivered = useCallback(() => {
    setOrder(prev => ({ ...prev, orderState: "DELIVERED", deliveredAt: new Date().toISOString() }));
    showToast("🎉 Cart order delivered successfully!");
  }, []);

  const handleDeliveryFailed = useCallback(async (reason) => {
    try {
      const res = await API.put(`/cart/updateCartOrderStatus/${order.cartOrderId}`, {
        orderState: "CANCELLED",
        reason,
      });
      if (res.data.success) {
        setOrder(prev => ({ ...prev, orderState: "CANCELLED", cancellationReason: reason, cancelledAt: new Date().toISOString() }));
        showToast("Delivery marked as failed");
      } else {
        throw new Error(res.data.message || "Failed");
      }
    } catch (err) {
      showToast("Failed to update status", "error");
      throw err;
    }
  }, [order]);

  // ── Payment method change handler: selecting "Online" opens the QR popup ──
  const handlePaymentMethodChange = useCallback((val) => {
    setPaymentMethod(val);
    if (val === "ONLINE") {
      setShowQRModal(true);
    }
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const isShipped   = order?.orderState === "SHIPPED";
  const isConfirmed = order?.orderState === "CONFIRMED";
  const isDone      = ["DELIVERED", "CANCELLED"].includes(order?.orderState);

  const subtotal        = Number(order?.subtotal        || 0);
  const totalDiscount   = Number(order?.totalDiscount   || 0);
  const voucherDiscount = Number(order?.voucherDiscount || 0);
  const deliveryCharge  = Number(order?.deliveryCharge  || 0);
  const totalPrice      = Number(order?.totalPrice      || 0);

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
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%,60% { transform:translateX(-6px); }
          40%,80% { transform:translateX(6px); }
        }
        @keyframes confettiFall {
          0%   { transform:translateY(0) rotate(0deg); opacity:1; }
          100% { transform:translateY(110vh) rotate(720deg); opacity:0; }
        }
        @keyframes floatUp {
          0%   { transform:translateY(0) scale(0.8); opacity:0; }
          20%  { opacity:1; }
          80%  { opacity:1; }
          100% { transform:translateY(-260px) scale(1.1); opacity:0; }
        }
        @keyframes celebrationPop {
          0%   { opacity:0; transform:scale(0.5); }
          60%  { transform:scale(1.08); }
          100% { opacity:1; transform:scale(1); }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 99999,
          padding: "12px 22px", borderRadius: 14,
          background: toast.type === "error" ? "rgba(239,68,68,0.18)" : "rgba(34,197,94,0.18)",
          border: `1px solid ${toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
          color: toast.type === "error" ? "#fca5a5" : "#86efac",
          fontSize: 13, fontWeight: 700,
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)", backdropFilter: "blur(12px)",
          animation: "toastIn 0.28s cubic-bezier(0.34,1.42,0.64,1) both",
        }}>
          {toast.msg}
        </div>
      )}

      {/* QR Payment Modal — opens automatically when "Pay Online" is selected */}
      {showQRModal && order && (
        <QRPaymentModal order={order} onClose={() => setShowQRModal(false)} />
      )}

      <div>
        {/* ── Back + Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/delivery-boy/deliveries")}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 11,
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to Orders
          </button>

          <div style={{ flex: 1 }}>
            {/* Cart badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 4, padding: "2px 10px", borderRadius: 20, background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="2.5">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
              </svg>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#67e8f9" }}>Cart Order</span>
            </div>
            <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 900, margin: 0, letterSpacing: "-0.3px" }}>
              Cart Order <span style={{ color: "#67e8f9", fontFamily: "monospace" }}>#{cartOrderId}</span>
            </h1>
            {!loading && order && (
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "3px 0 0" }}>
                Placed on {fmtDate(order.createdAt)} · {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {!loading && order && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {/* ── Payment Method Dropdown (left of Print Bill) ── */}
              <PaymentMethodDropdown
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              />

              <button
                onClick={() => printCartBill(order)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 12,
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
            </div>
          )}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[280, 200, 320].map((h, i) => (
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

            {/* ── 1. Order Summary ── */}
            <SectionCard title="Order Summary" icon="📋">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 0 }}>
                <div>
                  <InfoRow label="Cart Order ID"   value={`#${order.cartOrderId}`} mono accent="#67e8f9" />
                  <InfoRow label="Order State"     value={<StatusBadge status={order.orderState}    styles={ORDER_STATUS_STYLES} />} />
                  <InfoRow label="Payment Status"  value={<StatusBadge status={order.paymentStatus} styles={PAY_STATUS_STYLES} />} />
                  <InfoRow label="Payment Method"  value={PAY_METHOD_LABEL[order.payMethod] || order.payMethod || "—"} />
                  <InfoRow
                    label="Collection Mode"
                    value={paymentMethod === "ONLINE" ? "Pay Online (UPI/QR)" : "Cash on Delivery"}
                    accent={paymentMethod === "ONLINE" ? "#4ade80" : "#fbbf24"}
                  />
                  <InfoRow label="Total Items"     value={order.items?.length ?? "—"} accent="#c4b5fd" />
                </div>
                <div style={{ paddingLeft: 20 }}>
                  <InfoRow label="Placed On"    value={fmtDate(order.createdAt)} />
                  {order.confirmedAt  && <InfoRow label="Confirmed At"  value={fmtDate(order.confirmedAt)} />}
                  {order.shippedAt    && <InfoRow label="Shipped At"    value={fmtDate(order.shippedAt)} />}
                  {order.deliveredAt  && <InfoRow label="Delivered At"  value={fmtDate(order.deliveredAt)} />}
                  {order.cancelledAt  && <InfoRow label="Cancelled At"  value={fmtDate(order.cancelledAt)} />}
                  {order.cancellationReason && <InfoRow label="Cancel Reason" value={order.cancellationReason} accent="#fca5a5" />}
                </div>
              </div>
            </SectionCard>

            {/* ── 2. Customer + Address + Delivery Action ── */}
            <SectionCard title="Customer Details" icon="👤">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 0 }}>
                <div>
                  <InfoRow label="Customer ID" value={order.customer?.customerId}  mono accent="#67e8f9" />
                  <InfoRow label="Username"    value={order.customer?.username}    accent="#fff" />
                  <InfoRow label="Email"       value={order.customer?.email} />
                  <InfoRow label="Mobile"      value={order.customer?.phone || "—"} accent="#fbbf24" />
                  {order.customer?.altPhone && <InfoRow label="Alt Mobile" value={order.customer.altPhone} />}
                  {order.customer?.gender    && <InfoRow label="Gender"    value={order.customer.gender}  />}
                </div>
                <div style={{ paddingLeft: 20 }}>
                  <DeliveryAddressBlock deliveryAddress={order.deliveryAddress} />

                  {/* Delivery code panel — only when SHIPPED */}
                  {isShipped && (
                    <CartDeliveryCodePanel
                      order={order}
                      onDelivered={handleDelivered}
                      onDeliveryFailed={handleDeliveryFailed}
                    />
                  )}

                  {isConfirmed && (
                    <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)", color: "#93c5fd", fontSize: 12, fontWeight: 600, textAlign: "center" }}>
                      Order confirmed. Awaiting shipment dispatch.
                    </div>
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

            {/* ── 3. Cart Items ── */}
            <SectionCard title={`Cart Items (${order.items?.length || 0})`} icon="🛒">
              <CartItemsTable items={order.items} />
            </SectionCard>

            {/* ── 4. Pricing Breakdown ── */}
            <SectionCard title="Pricing Breakdown" icon="💰">
              <div style={{ maxWidth: 420 }}>
                <InfoRow label="Subtotal (MRP)"       value={`₹${fmt(subtotal + totalDiscount)}`} />
                {totalDiscount > 0   && <InfoRow label="Product Discount"  value={`− ₹${fmt(totalDiscount)}`}   accent="#4ade80" />}
                {voucherDiscount > 0 && <InfoRow label="Voucher Discount"  value={`− ₹${fmt(voucherDiscount)}`} accent="#4ade80" />}
                <InfoRow label="After Discount"        value={`₹${fmt(subtotal - voucherDiscount)}`} accent="#fbbf24" />
                <InfoRow label="Delivery Charge"       value={deliveryCharge === 0 ? "FREE" : `₹${fmt(deliveryCharge)}`} accent={deliveryCharge === 0 ? "#4ade80" : undefined} />
                <InfoRow label="Platform Charge"       value="₹0" accent="#4ade80" />

                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 0 0", marginTop: 6,
                  borderTop: "1px solid rgba(139,92,246,0.2)",
                }}>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>Total Amount</span>
                  <span style={{ color: "#fbbf24", fontSize: 22, fontWeight: 900 }}>₹{fmt(totalPrice)}</span>
                </div>

                {order.voucherId && (
                  <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 10, background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.18)", fontSize: 11, color: "#c4b5fd" }}>
                    🎟️ Voucher applied: <strong>{order.voucherId}</strong>
                    {voucherDiscount > 0 && <span style={{ color: "#4ade80", marginLeft: 6 }}>−₹{fmt(voucherDiscount)}</span>}
                  </div>
                )}
              </div>
            </SectionCard>

          </div>
        )}
      </div>
    </>
  );
}