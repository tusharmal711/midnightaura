// OrderDetail.jsx
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { ImCross } from "react-icons/im";
import { API } from "../../api";
import { IoSend } from "react-icons/io5";

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

const PAY_METHOD_LABEL = {
  COD: "Cash on Delivery",
  CARD: "Card",
  UPI: "UPI",
};

// ─── Open Google Maps with lat/lng ────────────────────────────────────────────
const openGoogleMaps = (lat, lng) => {
  const url = `https://www.google.com/maps?q=${lat},${lng}&z=17&hl=en`;
  window.open(url, "_blank", "noopener,noreferrer");
};

// ─── Status config ────────────────────────────────────────────────────────────
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

// ─── Section Card ─────────────────────────────────────────────────────────────
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

// ─── Info Row ─────────────────────────────────────────────────────────────────
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

// ─── Delivery Address Block with Track Location ───────────────────────────────
function DeliveryAddressBlock({ deliveryAddress, addrParts }) {
  const hasLocation =
    deliveryAddress?.location?.lat && deliveryAddress?.location?.lng;

  return (
    <div>
      <p style={{
        color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700,
        letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px",
      }}>
        Delivery Address
      </p>

      {addrParts.length > 0 ? (
        <div style={{
          background: "rgba(255,255,255,0.04)", borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.07)", padding: "12px 14px",
        }}>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            {addrParts.join(", ")}
          </p>

          {/* ── Track Location button ── */}
          {hasLocation ? (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() =>
                  openGoogleMaps(
                    deliveryAddress.location.lat,
                    deliveryAddress.location.lng
                  )
                }
                title={`Lat: ${deliveryAddress.location.lat}, Lng: ${deliveryAddress.location.lng}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 13px", borderRadius: 10,
                  fontSize: 11, fontWeight: 800,
                  background: "rgba(34,197,94,0.12)",
                  color: "#4ade80",
                  border: "1px solid rgba(34,197,94,0.32)",
                  cursor: "pointer",
                  transition: "background 0.15s, transform 0.12s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(34,197,94,0.22)";
                  e.currentTarget.style.transform  = "scale(1.04)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(34,197,94,0.12)";
                  e.currentTarget.style.transform  = "scale(1)";
                }}
              >
                {/* Map pin icon */}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                Track Location
                {/* External link icon */}
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" style={{ opacity: 0.6 }}>
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>

              {/* Coordinates hint */}
              {/* <span style={{
                fontSize: 10, color: "rgba(74,222,128,0.45)", fontFamily: "monospace",
              }}>
                {deliveryAddress.location.lat.toFixed(5)}, {deliveryAddress.location.lng.toFixed(5)}
              </span> */}

              {/* Label if set */}
              {/* {deliveryAddress.location.label && (
                <span style={{
                  fontSize: 10, color: "rgba(74,222,128,0.55)",
                  background: "rgba(34,197,94,0.07)",
                  border: "1px solid rgba(34,197,94,0.18)",
                  borderRadius: 6, padding: "2px 7px",
                }}>
                  📍 {deliveryAddress.location.label}
                </span>
              )} */}
            </div>
          ) : (
            /* No GPS pin set */
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 600 }}>
                No GPS pin set by customer
              </span>
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>No address on file</p>
      )}
    </div>
  );
}

// ─── Cancel Reason Modal ──────────────────────────────────────────────────────
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

// ─── Delivery Failed Reason Modal ─────────────────────────────────────────────
const DELIVERY_FAIL_REASONS = [
  "Customer not available",
  "Wrong address",
  "Customer refused delivery",
  "Access to location denied",
  "Item damaged in transit",
  "Other",
];

function DeliveryFailedModal({ order, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState(DELIVERY_FAIL_REASONS[0]);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)",
    }}>
      <div style={{
        borderRadius: 22, padding: 28, width: "100%", maxWidth: 400,
        background: "#0f0f14", border: "1px solid rgba(239,68,68,0.28)",
        boxShadow: "0 50px 120px rgba(0,0,0,0.95)",
        animation: "fadeIn 0.25s ease both",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>⚠️</div>
          <h3 style={{ color: "#fff", fontSize: 15, fontWeight: 800, margin: 0 }}>Delivery Failed</h3>
        </div>
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: "0 0 20px 46px" }}>
          Please select the reason for failed delivery
        </p>
        <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6 }}>
          Reason
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{
            width: "100%", borderRadius: 12, padding: "11px 14px",
            fontSize: 13, marginBottom: 22, outline: "none", boxSizing: "border-box",
            background: "#07070A", border: "1px solid rgba(255,255,255,0.1)", color: "#fff",
            appearance: "none",
          }}
        >
          {DELIVERY_FAIL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
            }}
          >Back</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            style={{
              flex: 1, padding: "12px", borderRadius: 12, fontSize: 13, fontWeight: 700,
              background: "rgba(239,68,68,0.18)", color: "#fca5a5",
              border: "1px solid rgba(239,68,68,0.35)",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
            }}
          >{loading ? "Submitting…" : "Submit"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── 6-Digit OTP Input ────────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const refs = useRef(
    Array.from({ length: 6 }, () => React.createRef())
  );

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
    <div style={{
      width: "100%", display: "grid",
      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
      gap: 10, alignItems: "center",
    }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs.current[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: "100%", aspectRatio: "1 / 1.15", minHeight: 54,
            borderRadius: 14, textAlign: "center",
            fontSize: 24, fontWeight: 900, fontFamily: "monospace",
            outline: "none",
            background: value[i] ? "rgba(6,182,212,0.12)" : "rgba(255,255,255,0.04)",
            border:     value[i] ? "2px solid rgba(6,182,212,0.55)" : "2px solid rgba(255,255,255,0.1)",
            color:      value[i] ? "#67e8f9" : "rgba(255,255,255,0.4)",
            transition: "all 0.15s",
            cursor: disabled ? "not-allowed" : "text",
            opacity: disabled ? 0.6 : 1,
            caretColor: "#67e8f9",
            boxShadow: value[i] ? "0 0 16px rgba(6,182,212,0.18)" : "none",
            backdropFilter: "blur(8px)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Delivery Code Panel ──────────────────────────────────────────────────────
function DeliveryCodePanel({ order, onDelivered, onDeliveryFailed, onSendCode }) {
  const [codeSent,       setCodeSent]       = useState(false);
  const [sendLoading,    setSendLoading]    = useState(false);
  const [otp,            setOtp]            = useState("");
  const [verifying,      setVerifying]      = useState(false);
  const [verified,       setVerified]       = useState(false);
  const [verifyError,    setVerifyError]    = useState("");
  const [actionLoad,     setActionLoad]     = useState(false);
  const [showFailModal,  setShowFailModal]  = useState(false);
  const [failLoad,       setFailLoad]       = useState(false);
  const [showCelebration,setShowCelebration]= useState(false);
  const [floatingCharges,setFloatingCharges]= useState([]);

  const delivery = Number(order?.deliveryCharge || 0);

  const handleSendCode = async () => {
    setSendLoading(true);
    try {
      const res = await API.post(`/delivery/sendDeliveryCode/${order.orderId}`);
      if (res.data.success) {
        setCodeSent(true);
        console.log("Generated Code:", res.data.code);
      } else {
        setVerifyError(res.data.message || "Failed to send code");
      }
    } catch (error) {
      setVerifyError(error.response?.data?.message || "Failed to send delivery code");
    } finally {
      setSendLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) { setVerifyError("Please enter valid 6 digit code"); return; }
    setVerifyError("");
    setVerifying(true);
    try {
      const res = await API.post(`/delivery/verifyDeliveryCode/${order.orderId}`, { code: otp });
      if (res.data.success) {
        setVerified(true);
      } else {
        setVerifyError(res.data.message || "Invalid code");
        setOtp("");
      }
    } catch (error) {
      setVerifyError(error.response?.data?.message || "Verification failed");
      setOtp("");
    } finally {
      setVerifying(false);
    }
  };

  const handleDelivered = async () => {
    setActionLoad(true);
    try {
      const res = await API.put(`/productBuy/updateOrderStatus/${order.orderId}`, { orderState: "DELIVERED" });
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
      // handled upstream
    } finally {
      setActionLoad(false);
    }
  };

  const handleFailConfirm = async (reason) => {
    setFailLoad(true);
    try {
      await onDeliveryFailed(reason);
      setShowFailModal(false);
    } catch (e) {
      // error upstream
    } finally {
      setFailLoad(false);
    }
  };

  return (
    <>
      {showFailModal && (
        <DeliveryFailedModal
          order={order}
          onConfirm={handleFailConfirm}
          onClose={() => setShowFailModal(false)}
          loading={failLoad}
        />
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99990,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.88)", backdropFilter: "blur(16px)",
          pointerEvents: "none",
        }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${5 + Math.random() * 90}%`,
              top: `-${10 + Math.random() * 20}px`,
              width: `${6 + Math.random() * 10}px`,
              height: `${6 + Math.random() * 10}px`,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              background: ["#4ade80","#fbbf24","#a78bfa","#67e8f9","#f472b6","#fb923c"][i % 6],
              animation: `confettiFall ${1.2 + Math.random() * 1.4}s ${Math.random() * 0.5}s ease-in forwards`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }} />
          ))}

          {floatingCharges.map((fc) => (
            <div key={fc.id} style={{
              position: "absolute",
              left: `${fc.x}%`, bottom: "20%",
              animation: `floatUp 2.8s ${fc.delay}s ease-out forwards`,
              transform: `rotate(${fc.rotate}deg)`,
              background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.5)",
              borderRadius: 12, padding: "6px 14px",
              color: "#4ade80", fontSize: 14, fontWeight: 900,
              whiteSpace: "nowrap", pointerEvents: "none",
            }}>
              +₹{fmt(delivery)} Delivery
            </div>
          ))}

          <div style={{ textAlign: "center", animation: "celebrationPop 0.5s cubic-bezier(0.34,1.52,0.64,1) both" }}>
            <div style={{ fontSize: 72, marginBottom: 12, filter: "drop-shadow(0 0 30px rgba(74,222,128,0.6))" }}>🎉</div>
            <div style={{ color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 6, textShadow: "0 0 40px rgba(74,222,128,0.5)" }}>
              Delivered Successfully!
            </div>
            <div style={{ color: "#4ade80", fontSize: 15, fontWeight: 700 }}>
              ₹{fmt(delivery)} delivery charge added to profile ↑
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        {!codeSent ? (
          /* ── Step 1: Send Code ── */
          <button
            onClick={handleSendCode}
            disabled={sendLoading}
            style={{
              width: "100%", padding: "13px 20px", borderRadius: 14,
              fontSize: 13, fontWeight: 800,
              background: sendLoading
                ? "rgba(6,182,212,0.08)"
                : "linear-gradient(135deg,rgba(6,182,212,0.25),rgba(6,182,212,0.12))",
              color: "#67e8f9", border: "1px solid rgba(6,182,212,0.4)",
              cursor: sendLoading ? "not-allowed" : "pointer",
              opacity: sendLoading ? 0.7 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.15s", boxShadow: "0 4px 20px rgba(6,182,212,0.12)",
            }}
          >
            {sendLoading ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.22-8.56"/>
                </svg>
                Sending Code…
              </>
            ) : (
              <>
                <IoSend />
                Send Delivery Code to Customer
              </>
            )}
          </button>

        ) : !verified ? (
          /* ── Step 2: OTP Entry ── */
          <div style={{
            width: "100%", maxWidth: 460, margin: "0 auto",
            background: "linear-gradient(180deg, rgba(10,25,40,0.96) 0%, rgba(8,18,32,0.98) 100%)",
            border: "1px solid rgba(6,182,212,0.22)", borderRadius: 24,
            padding: "22px 20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)",
            overflow: "hidden", animation: "fadeIn 0.3s ease both", backdropFilter: "blur(18px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <div style={{
                minWidth: 42, width: 42, height: 42, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(6,182,212,0.1))",
                border: "1px solid rgba(6,182,212,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#67e8f9", fontSize: 20,
                boxShadow: "0 0 20px rgba(6,182,212,0.18)",
              }}>
                <MdOutlineVerifiedUser />
              </div>
              <div>
                <p style={{ color: "#67e8f9", fontSize: 18, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                  Code sent to customer
                </p>
                <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>
                  Enter the 6-digit delivery verification code
                </p>
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", justifyContent: "center", overflow: "hidden" }}>
              <OTPInput value={otp} onChange={setOtp} disabled={verifying} />
            </div>

            {verifyError && (
              <p style={{ color: "#fca5a5", fontSize: 12, fontWeight: 700, textAlign: "center", marginTop: 16, animation: "shake 0.3s ease" }}>
                {verifyError}
              </p>
            )}

            <button
              onClick={handleVerify}
              disabled={verifying || otp.length < 6}
              style={{
                width: "100%", marginTop: 22, padding: "14px", borderRadius: 16,
                fontSize: 15, fontWeight: 800,
                background:    otp.length === 6 ? "linear-gradient(135deg, rgba(6,182,212,0.38), rgba(6,182,212,0.18))" : "rgba(255,255,255,0.04)",
                color:         otp.length === 6 ? "#67e8f9" : "rgba(255,255,255,0.25)",
                border: `1px solid ${otp.length === 6 ? "rgba(6,182,212,0.45)" : "rgba(255,255,255,0.07)"}`,
                cursor:        verifying || otp.length < 6 ? "not-allowed" : "pointer",
                transition:    "all 0.2s ease",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow:     otp.length === 6 ? "0 10px 30px rgba(6,182,212,0.15)" : "none",
              }}
            >
              {verifying ? "Verifying..." : "Verify Code"}
            </button>
          </div>

        ) : (
          /* ── Step 3: Verified — Delivered / Failed ── */
          <div style={{ animation: "fadeIn 0.3s ease both" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 14px", borderRadius: 12, marginBottom: 14,
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
              }}>✓</div>
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
                  background: "rgba(239,68,68,0.1)",
                  color: "#fca5a5", border: "1px solid rgba(239,68,68,0.3)",
                  cursor: actionLoad ? "not-allowed" : "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 22 }}><ImCross className="text-red-800"/></span>
                <span>Delivery Failed</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Print Bill ───────────────────────────────────────────────────────────────
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
  const showPaymentStatus = order.payMethod === "CARD" || order.payMethod === "UPI";
  const payStatusColor = {
    PAID:    "#16a34a",
    FAILED:  "#dc2626",
    PENDING: "#b45309",
  }[order.paymentStatus] || "#111";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Invoice – ${order.orderId}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'DM Sans', sans-serif; background:#fff; color:#1a1a1a; font-size:13px; }
  .page { max-width:660px; margin:0 auto; padding:32px 30px; }
  .header { display:flex; justify-content:space-between; align-items:center; padding-bottom:22px; border-bottom:1.5px solid #e8e2d4; margin-bottom:24px; }
  .brand { display:flex; align-items:center; gap:13px; }
  .brand-logo-wrap { position:relative; width:52px; height:52px; }
  .brand-logo-wrap svg { width:52px; height:52px; }
  .brand-name { font-family:'Playfair Display',serif; font-size:19px; font-weight:900; color:#0d1117; letter-spacing:0.04em; text-transform:uppercase; }
  .brand-sub { font-size:9px; color:#9a8a6a; letter-spacing:0.18em; text-transform:uppercase; font-weight:600; margin-top:2px; }
  .invoice-meta { text-align:right; }
  .inv-label { font-size:9px; color:#aaa; text-transform:uppercase; letter-spacing:0.12em; font-weight:600; }
  .inv-id { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#0d1117; letter-spacing:0.02em; margin:2px 0; }
  .inv-date { font-size:11px; color:#888; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
  .info-block { background:#faf9f6; border-radius:12px; padding:14px 16px; border:1px solid #ede8df; }
  .info-block-label { font-size:9px; text-transform:uppercase; letter-spacing:0.13em; color:#b09a7a; font-weight:700; margin-bottom:9px; padding-bottom:7px; border-bottom:1px solid #ede8df; }
  .info-block p { font-size:12px; color:#333; line-height:1.7; }
  .info-bold { font-weight:700; font-size:13px; color:#0d1117; }
  .product-block { background:#faf9f6; border-radius:12px; padding:14px 16px; margin-bottom:20px; border:1px solid #ede8df; }
  .product-block-label { font-size:9px; text-transform:uppercase; letter-spacing:0.13em; color:#b09a7a; font-weight:700; margin-bottom:9px; padding-bottom:7px; border-bottom:1px solid #ede8df; }
  .product-name { font-family:'Playfair Display',serif; font-size:15px; font-weight:700; color:#0d1117; margin-bottom:6px; }
  .product-meta { display:flex; flex-wrap:wrap; gap:6px; }
  .product-tag { display:inline-block; background:#0d1117; color:#fff; font-size:9px; font-weight:700; padding:3px 9px; border-radius:20px; letter-spacing:0.06em; }
  .product-tag-light { display:inline-block; background:#ede8df; color:#6b5a3e; font-size:9px; font-weight:700; padding:3px 9px; border-radius:20px; letter-spacing:0.06em; }
  .status-row { display:flex; gap:10px; margin-bottom:20px; }
  .status-pill { flex:1; background:#faf9f6; border-radius:10px; padding:10px 12px; text-align:center; border:1px solid #ede8df; }
  .pill-label { font-size:8px; text-transform:uppercase; letter-spacing:0.12em; color:#b09a7a; font-weight:700; margin-bottom:4px; }
  .pill-value { font-size:12px; font-weight:800; color:#0d1117; }
  .pricing-wrap { border:1px solid #ede8df; border-radius:12px; overflow:hidden; margin-bottom:20px; }
  .pricing-header { display:grid; grid-template-columns:2fr 0.5fr 1fr 1fr; background:#0d1117; padding:9px 14px; gap:6px; }
  .pricing-header span { font-size:9px; text-transform:uppercase; letter-spacing:0.1em; color:#c9b99a; font-weight:700; }
  .pricing-header span:nth-child(2), .pricing-header span:nth-child(3), .pricing-header span:nth-child(4) { text-align:right; }
  .pricing-row { display:grid; grid-template-columns:2fr 0.5fr 1fr 1fr; padding:9px 14px; gap:6px; border-bottom:1px solid #f0ebe2; }
  .pricing-row span { font-size:12px; color:#333; }
  .pricing-row span:nth-child(2), .pricing-row span:nth-child(3), .pricing-row span:nth-child(4) { text-align:right; font-weight:600; color:#0d1117; }
  .pricing-row.discount span { color:#16a34a; }
  .pricing-row.subtotal { background:#faf9f6; }
  .pricing-row.subtotal span { font-weight:600; color:#555; }
  .pricing-row.free span { color:#16a34a; font-weight:600; }
  .pricing-total { display:grid; grid-template-columns:2fr 0.5fr 1fr 1fr; padding:12px 14px; gap:6px; background:#0d1117; }
  .pricing-total span { font-size:13px; font-weight:800; color:#f5f0e8; }
  .pricing-total span:last-child { text-align:right; color:#c9b99a; font-size:15px; font-family:'Playfair Display',serif; }
  .pricing-total span:nth-child(2), .pricing-total span:nth-child(3) { text-align:right; }
  .footer { display:flex; justify-content:space-between; align-items:flex-end; border-top:1.5px solid #e8e2d4; padding-top:18px; }
  .footer-brand { display:flex; align-items:center; gap:10px; }
  .footer-brand-name { font-family:'Playfair Display',serif; font-size:15px; font-weight:700; color:#0d1117; }
  .footer-tagline { font-size:10px; color:#aaa; margin-top:2px; }
  .footer-note { font-size:10px; color:#bbb; text-align:right; line-height:1.6; }
  @media print {
    body { print-color-adjust:exact; -webkit-print-color-adjust:exact; }
    .page { padding:18px 16px; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="brand">
      <div class="brand-logo-wrap">
        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="26" cy="26" r="25" stroke="#b09a7a" stroke-width="1.2" fill="none"/>
          <path d="M26 8 C26 8 22 11 22 14 C22 17 24 18.5 26 18.5 C28 18.5 30 17 30 14 C30 11 26 8 26 8Z" fill="none" stroke="#b09a7a" stroke-width="1"/>
          <path d="M24 9 C21 10.5 20 13 21 15.5" stroke="#b09a7a" stroke-width="0.9" stroke-linecap="round"/>
          <ellipse cx="26" cy="32" rx="12" ry="13" fill="#0d1117"/>
          <ellipse cx="26" cy="29" rx="10" ry="9" fill="#1a1a2e"/>
          <circle cx="22" cy="27" r="3.5" fill="#b09a7a"/>
          <circle cx="22" cy="27" r="2" fill="#0d1117"/>
          <circle cx="22.8" cy="26.2" r="0.7" fill="#fff"/>
          <circle cx="30" cy="27" r="3.5" fill="#b09a7a"/>
          <circle cx="30" cy="27" r="2" fill="#0d1117"/>
          <circle cx="30.8" cy="26.2" r="0.7" fill="#fff"/>
          <path d="M24.5 30.5 L26 32.5 L27.5 30.5 Z" fill="#b09a7a"/>
          <path d="M18 22 L16 17 L20 20 Z" fill="#0d1117"/>
          <path d="M34 22 L36 17 L32 20 Z" fill="#0d1117"/>
          <path d="M15 33 C14 36 15 39 18 40" stroke="#b09a7a" stroke-width="0.9" stroke-linecap="round" fill="none"/>
          <path d="M37 33 C38 36 37 39 34 40" stroke="#b09a7a" stroke-width="0.9" stroke-linecap="round" fill="none"/>
          <path d="M22 43 L20 46 M22 43 L22 46 M22 43 L24 46" stroke="#b09a7a" stroke-width="0.9" stroke-linecap="round"/>
          <path d="M30 43 L28 46 M30 43 L30 46 M30 43 L32 46" stroke="#b09a7a" stroke-width="0.9" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="brand-text">
        <div class="brand-name">Midnight Aura</div>
        <div class="brand-sub">Premium Fashion · Invoice</div>
      </div>
    </div>
    <div class="invoice-meta">
      <div class="inv-label">Invoice / Order ID</div>
      <div class="inv-id">#${order.orderId}</div>
      <div class="inv-date">${fmtDate(order.createdAt)}</div>
    </div>
  </div>

  <div class="grid2">
    <div class="info-block">
      <div class="info-block-label">Customer Details</div>
      <p><span class="info-bold">${customer?.username || "—"}</span></p>
      <p style="font-size:11px;color:#888;margin-bottom:4px;">ID: ${customer?.customerId || "—"}</p>
      <p>${customer?.email || "—"}</p>
      <p>📞 ${customer?.phone || "—"}</p>
      ${customer?.altPhone ? `<p>📞 Alt: ${customer.altPhone}</p>` : ""}
      ${customer?.gender ? `<p>Gender: ${customer.gender}</p>` : ""}
    </div>
    <div class="info-block">
      <div class="info-block-label">Delivery Address</div>
      <p>${addrParts.join(", ") || "Not provided"}</p>
    </div>
  </div>

  <div class="product-block">
    <div class="product-block-label">Product Details</div>
    <div class="product-name">${product?.productName || "—"}</div>
    <div class="product-meta" style="margin-bottom:8px;">
      ${product?.category    ? `<span class="product-tag">${product.category}</span>` : ""}
      ${product?.subCategory ? `<span class="product-tag-light">${product.subCategory}</span>` : ""}
      ${order.size           ? `<span class="product-tag-light">Size: ${order.size.toUpperCase()}</span>` : ""}
      ${order.quantity       ? `<span class="product-tag-light">Qty: ${order.quantity}</span>` : ""}
      ${product?.productColor?.name ? `<span class="product-tag-light">${product.productColor.name}</span>` : ""}
    </div>
    <p style="font-size:11px;color:#aaa;font-family:monospace;">ID: ${product?.productId || "—"}</p>
  </div>

  <div class="status-row">
    ${showPaymentStatus ? `
    <div class="status-pill">
      <div class="pill-label">Payment Status</div>
      <div class="pill-value" style="color:${payStatusColor};">${order.paymentStatus || "—"}</div>
    </div>` : ""}
    <div class="status-pill">
      <div class="pill-label">Payment Method</div>
      <div class="pill-value" style="font-size:11px;">${payMethodDisplay}</div>
    </div>
    <div class="status-pill">
      <div class="pill-label">Order Date</div>
      <div class="pill-value" style="font-size:10px;">${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
    </div>
  </div>

  <div class="pricing-wrap">
    <div class="pricing-header">
      <span>Description</span><span>Qty</span><span>Unit Price</span><span>Amount</span>
    </div>
    <div class="pricing-row">
      <span>${product?.productName || "Product"}</span>
      <span>${qty}</span>
      <span>₹${fmt(price)}</span>
      <span>₹${fmt(price * qty)}</span>
    </div>
    ${discount > 0 ? `
    <div class="pricing-row discount">
      <span>Discount (${discount}%)</span>
      <span>—</span><span>—</span>
      <span>− ₹${fmt((price - finalPrice) * qty)}</span>
    </div>` : ""}
    <div class="pricing-row subtotal">
      <span>Subtotal</span>
      <span>${qty}</span>
      <span>₹${fmt(finalPrice)}</span>
      <span>₹${fmt(finalPrice * qty)}</span>
    </div>
    <div class="pricing-row ${delivery === 0 ? "free" : ""}">
      <span>Delivery Charges</span>
      <span>—</span><span>—</span>
      <span>${delivery === 0 ? "FREE" : "₹" + fmt(delivery)}</span>
    </div>
    <div class="pricing-row free">
      <span>Platform Charges</span>
      <span>—</span><span>—</span>
      <span>₹0</span>
    </div>
    <div class="pricing-total">
      <span>Total Amount Payable</span>
      <span></span><span></span>
      <span>₹${fmt(total)}</span>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">
      <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" width="32" height="32">
        <circle cx="26" cy="26" r="25" stroke="#b09a7a" stroke-width="1.2" fill="none"/>
        <ellipse cx="26" cy="32" rx="12" ry="13" fill="#0d1117"/>
        <ellipse cx="26" cy="29" rx="10" ry="9" fill="#1a1a2e"/>
        <circle cx="22" cy="27" r="3.5" fill="#b09a7a"/>
        <circle cx="22" cy="27" r="2" fill="#0d1117"/>
        <circle cx="22.8" cy="26.2" r="0.7" fill="#fff"/>
        <circle cx="30" cy="27" r="3.5" fill="#b09a7a"/>
        <circle cx="30" cy="27" r="2" fill="#0d1117"/>
        <circle cx="30.8" cy="26.2" r="0.7" fill="#fff"/>
        <path d="M24.5 30.5 L26 32.5 L27.5 30.5 Z" fill="#b09a7a"/>
        <path d="M18 22 L16 17 L20 20 Z" fill="#0d1117"/>
        <path d="M34 22 L36 17 L32 20 Z" fill="#0d1117"/>
      </svg>
      <div>
        <div class="footer-brand-name">Midnight Aura</div>
        <div class="footer-tagline">Thank you for shopping with us ✨</div>
      </div>
    </div>
    <div class="footer-note">
      This is a computer-generated invoice.<br/>No signature required.
    </div>
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function DeliveryProductDetails() {
  const { orderId } = useParams();
  const navigate    = useNavigate();

  const [order,      setOrder]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelLoad, setCancelLoad] = useState(false);
  const [toast,      setToast]      = useState(null);
  const [imgIdx,     setImgIdx]     = useState(0);
  const [lightbox,   setLightbox]   = useState(false);
  const toastRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3200);
  };

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

  const handleSendDeliveryCode = useCallback(async () => {
    try {
      const res = await API.post(`/productBuy/sendDeliveryCode/${order.orderId}`);
      if (res.data.success) {
        showToast("Delivery code sent to customer 📲");
      } else {
        throw new Error(res.data.message || "Failed to send code");
      }
    } catch (err) {
      console.error("sendDeliveryCode error", err);
      showToast("Failed to send delivery code", "error");
      throw err;
    }
  }, [order]);

  const handleDelivered = useCallback(() => {
    setOrder((prev) => ({ ...prev, orderState: "DELIVERED", deliveredAt: new Date() }));
    showToast("🎉 Order delivered successfully!");
  }, []);

  const handleDeliveryFailed = useCallback(async (reason) => {
    try {
      const res = await API.put(`/productBuy/updateOrderStatus/${order.orderId}`, {
        orderState: "CANCELLED",
        reason,
        failureReason: reason,
      });
      if (res.data.success) {
        setOrder((prev) => ({ ...prev, orderState: "CANCELLED", cancellationReason: reason, cancelledAt: new Date() }));
        showToast("Delivery marked as failed");
      } else {
        throw new Error(res.data.message || "Failed");
      }
    } catch (err) {
      console.error("deliveryFailed error", err);
      showToast("Failed to update status", "error");
      throw err;
    }
  }, [order]);

  const handleCancelConfirm = useCallback(async (reason) => {
    setCancelLoad(true);
    try {
      const res = await API.put(`/productBuy/updateOrderStatus/${order.orderId}`, { orderState: "CANCELLED", reason });
      if (res.data.success) {
        setOrder((prev) => ({ ...prev, orderState: "CANCELLED", cancellationReason: reason, cancelledAt: new Date() }));
        setShowCancel(false);
        showToast("Order cancelled");
      }
    } catch (err) {
      console.error("cancel error", err);
      showToast("Failed to cancel order", "error");
    } finally {
      setCancelLoad(false);
    }
  }, [order]);

  const images      = order?.product?.productImages ?? [];
  const isConfirmed = order?.orderState === "CONFIRMED";
  const isShipped   = order?.orderState === "SHIPPED";
  const isDone      = ["DELIVERED", "CANCELLED"].includes(order?.orderState);
  const canCancel   = order?.orderState === "CONFIRMED";

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
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-6px); }
          40%,80% { transform: translateX(6px); }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(var(--r,0deg)) scale(0.8); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-260px) rotate(var(--r,0deg)) scale(1.1); opacity: 0; }
        }
        @keyframes celebrationPop {
          0%   { opacity:0; transform:scale(0.5); }
          60%  { transform:scale(1.08); }
          100% { opacity:1; transform:scale(1); }
        }
        .od-section { animation: fadeIn 0.3s ease both; }
        .od-img-thumb { cursor:pointer; transition:all 0.15s; border:2px solid transparent; border-radius:10px; overflow:hidden; }
        .od-img-thumb:hover { transform:scale(1.04); }
        .od-img-thumb.active { border-color: rgba(139,92,246,0.7); }
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
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          backdropFilter: "blur(12px)",
          animation: "toastIn 0.28s cubic-bezier(0.34,1.42,0.64,1) both",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Lightbox */}
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
                style={{ position:"fixed", left:18, top:"50%", transform:"translateY(-50%)", width:46, height:46, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", fontSize:22, cursor:"pointer", zIndex:99999, display:"flex", alignItems:"center", justifyContent:"center" }}
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); setImgIdx(i => (i + 1) % images.length); }}
                style={{ position:"fixed", right:18, top:"50%", transform:"translateY(-50%)", width:46, height:46, borderRadius:"50%", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", color:"#fff", fontSize:22, cursor:"pointer", zIndex:99999, display:"flex", alignItems:"center", justifyContent:"center" }}
              >›</button>
            </>
          )}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth:"min(500px,88vw)", maxHeight:"88vh", borderRadius:20, overflow:"hidden", boxShadow:"0 60px 160px rgba(0,0,0,0.95)" }}>
            <img src={getImageUrl(images[imgIdx])} alt="" style={{ width:"100%", height:"100%", objectFit:"contain", maxHeight:"88vh", display:"block" }} />
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && order && (
        <CancelModal order={order} onConfirm={handleCancelConfirm} onClose={() => setShowCancel(false)} loading={cancelLoad} />
      )}

      <div>
        {/* ── Back + Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/delivery-boy/deliveries")}
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/></svg>
                Print Bill
              </button>

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
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
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

            {/* ── 1. Order Details ── */}
            <SectionCard title="Order Details" icon="📋" className="od-section">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 0 }}>
                <div>
                  <InfoRow label="Order ID"       value={`#${order.orderId}`}  mono accent="#a78bfa" />
                  <InfoRow label="Order State"    value={<StatusBadge status={order.orderState}    styles={ORDER_STATUS_STYLES} />} />
                  <InfoRow label="Payment Status" value={<StatusBadge status={order.paymentStatus} styles={PAY_STATUS_STYLES} />} />
                  <InfoRow label="Payment Method" value={PAY_METHOD_LABEL[order.payMethod] || order.paymentMode || "—"} />
                </div>
                <div style={{ paddingLeft: 20 }}>
                  <InfoRow label="Placed On"  value={fmtDate(order.createdAt)} />
                  <InfoRow label="Size"       value={order.size?.toUpperCase() || "—"} accent="#c4b5fd" />
                  <InfoRow label="Quantity"   value={order.quantity ?? "—"} accent="#fbbf24" />
                  {order.cancellationReason && (
                    <InfoRow label="Cancel Reason" value={order.cancellationReason} accent="#fca5a5" />
                  )}
                  {order.cancelledAt && (
                    <InfoRow label="Cancelled At" value={fmtDate(order.cancelledAt)} />
                  )}
                </div>
              </div>
            </SectionCard>

            {/* ── 2. Customer Details ── */}
            <SectionCard title="Customer Details" icon="👤" className="od-section">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 0 }}>
                <div>
                  <InfoRow label="Customer ID"     value={order.customer?.customerId}  mono accent="#a78bfa" />
                  <InfoRow label="Username"         value={order.customer?.username}     accent="#fff" />
                  <InfoRow label="Email"            value={order.customer?.email} />
                  <InfoRow label="Mobile"           value={order.customer?.phone || "—"} accent="#fbbf24" />
                  <InfoRow label="Alternate Mobile" value={order.customer?.altPhone || "—"} />
                  {order.customer?.gender && (
                    <InfoRow label="Gender" value={order.customer.gender} />
                  )}
                </div>

                <div style={{ paddingLeft: 20 }}>
                  {/* ── Delivery Address with Track Location ── */}
                  <DeliveryAddressBlock
                    deliveryAddress={order.deliveryAddress}
                    addrParts={addrParts}
                  />

                  {/* ── SHIPPED: Delivery Code Panel ── */}
                  {isShipped && (
                    <DeliveryCodePanel
                      order={order}
                      onSendCode={handleSendDeliveryCode}
                      onDelivered={handleDelivered}
                      onDeliveryFailed={handleDeliveryFailed}
                    />
                  )}

                  {isConfirmed && (
                    <div style={{
                      marginTop: 16, padding: "12px 16px", borderRadius: 12,
                      background: "rgba(59,130,246,0.07)",
                      border: "1px solid rgba(59,130,246,0.18)",
                      color: "#93c5fd", fontSize: 12, fontWeight: 600, textAlign: "center",
                    }}>
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

            {/* ── 3. Product Details ── */}
            <SectionCard title="Product Details" icon="🛍️" className="od-section">
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {/* Product Images */}
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

                {/* Product Info */}
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

                  {/* Pricing breakdown */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)", borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden",
                  }}>
                    <div style={{ padding: "8px 14px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", margin: 0 }}>Pricing Breakdown</p>
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