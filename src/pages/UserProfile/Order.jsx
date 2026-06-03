import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { API } from "../../api";
import { FaImage } from "react-icons/fa6";
import { IoChatboxEllipses } from "react-icons/io5";

const SECRET_KEY = "midnightaura_secret_key";
const BASE_URL   = "http://localhost:8008";

const fmt     = (n) => "₹" + Number(n).toLocaleString("en-IN");
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const CANCEL_REASONS = [
  "Changed my mind",
  "Found a better price elsewhere",
  "Ordered by mistake",
  "Delivery taking too long",
  "Product no longer needed",
  "Other",
];

const RETURN_CAUSES = [
  "Defective / Damaged product",
  "Wrong item delivered",
  "Item not as described",
  "Size / fit issue",
  "Changed my mind",
  "Missing parts or accessories",
  "Other",
];

// Progress stages — RETURNED sits after DELIVERED as a terminal branch
const ORDER_STAGES         = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
const ORDER_STAGES_RETURNED = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "RETURNED"];

const STATE_COLORS = {
  PLACED:    { bg: "rgba(234,179,8,0.10)",  border: "rgba(234,179,8,0.30)",  text: "#fbbf24" },
  CONFIRMED: { bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.30)", text: "#60a5fa" },
  SHIPPED:   { bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.30)", text: "#a78bfa" },
  DELIVERED: { bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.30)",  text: "#4ade80" },
  CANCELLED: { bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.30)",  text: "#f87171" },
  RETURNED:  { bg: "rgba(251,146,60,0.10)", border: "rgba(251,146,60,0.30)", text: "#fb923c" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStoredEmail = () => {
  try { const s = localStorage.getItem("user"); if (s) { const p = JSON.parse(s); if (p?.email) return p.email; } } catch (_) {}
  try { const c = Cookies.get("user"); if (c) { const p = JSON.parse(c); if (p?.email) return p.email; } } catch (_) {}
  return null;
};

const imageUrl = (path) =>
  path ? (path.startsWith("/") ? `${BASE_URL}${path}` : path) : null;

const encodeProductId = (id) =>
  encodeURIComponent(CryptoJS.AES.encrypt(id, SECRET_KEY).toString());

// ── Progress Bar ──────────────────────────────────────────────────────────────
function OrderProgressBar({ state }) {
  const isCancelled = state === "CANCELLED";
  const isReturned  = state === "RETURNED";

  if (isCancelled) {
    return (
      <div className="px-5 pb-3 pt-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full shrink-0"
            style={{ width: 26, height: 26, background: "rgba(239,68,68,0.15)", border: "1.5px solid rgba(239,68,68,0.5)" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: "#f87171" }}>Order Cancelled</p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  const stages     = isReturned ? ORDER_STAGES_RETURNED : ORDER_STAGES;
  const currentIdx = stages.indexOf(state);

  const STAGE_LABELS = {
    PLACED: "Placed", CONFIRMED: "Confirmed", SHIPPED: "Shipped",
    DELIVERED: "Delivered", RETURNED: "Returned",
  };

  const STAGE_ICONS = {
    PLACED: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    CONFIRMED: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    SHIPPED: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    DELIVERED: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/>
      </svg>
    ),
    RETURNED: (
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 0 1 0 8h-1"/>
      </svg>
    ),
  };

  // For RETURNED state, use orange accent on the last stage
  const getStageColors = (stage, done, active) => {
    if (isReturned && stage === "RETURNED") {
      return {
        bg:     active ? "linear-gradient(135deg, #ea580c, #fb923c)" : "rgba(251,146,60,0.5)",
        border: active ? "1.5px solid #fb923c" : "1.5px solid rgba(251,146,60,0.45)",
        shadow: active ? "0 0 12px rgba(251,146,60,0.5)" : "none",
        color:  done ? "#fff" : "rgba(255,255,255,0.2)",
        lineGradient: "linear-gradient(90deg, rgba(251,146,60,0.65), rgba(251,146,60,0.3))",
      };
    }
    return {
      bg:     done ? (active ? "linear-gradient(135deg, #7c3aed, #a78bfa)" : "rgba(139,92,246,0.5)") : "rgba(255,255,255,0.05)",
      border: done ? (active ? "1.5px solid #a78bfa" : "1.5px solid rgba(139,92,246,0.45)") : "1.5px solid rgba(255,255,255,0.1)",
      shadow: active ? "0 0 12px rgba(139,92,246,0.5)" : "none",
      color:  done ? "#fff" : "rgba(255,255,255,0.2)",
      lineGradient: "linear-gradient(90deg, rgba(139,92,246,0.65), rgba(139,92,246,0.3))",
    };
  };

  return (
    <div className="px-5 pb-3 pt-1">
      <div className="flex items-center">
        {stages.map((stage, idx) => {
          const done   = idx <= currentIdx;
          const active = idx === currentIdx;
          const isLast = idx === stages.length - 1;
          const sc     = getStageColors(stage, done, active);

          const labelColor = isReturned && stage === "RETURNED" && done
            ? (active ? "#fb923c" : "rgba(251,146,60,0.6)")
            : active ? "#a78bfa" : done ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.18)";

          return (
            <div key={stage} className="flex items-center" style={{ flex: isLast ? "0 0 auto" : 1 }}>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center justify-center rounded-full transition-all duration-500"
                  style={{ width: active ? 26 : 20, height: active ? 26 : 20, background: sc.bg, border: sc.border, boxShadow: sc.shadow, color: sc.color, flexShrink: 0 }}>
                  {STAGE_ICONS[stage]}
                </div>
                <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: labelColor, whiteSpace: "nowrap" }}>
                  {STAGE_LABELS[stage]}
                </span>
              </div>
              {!isLast && (
                <div style={{ flex: 1, height: 1.5, marginBottom: 16, marginLeft: 3, marginRight: 3, borderRadius: 2, background: idx < currentIdx ? sc.lineGradient : "rgba(255,255,255,0.06)", transition: "background 0.5s" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Delivery Code Banner ──────────────────────────────────────────────────────
function DeliveryCodeBanner({ code }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div style={{ margin: "0 16px 14px", borderRadius: 14, padding: "14px 18px", background: "linear-gradient(135deg, rgba(139,92,246,0.13) 0%, rgba(99,102,241,0.10) 50%, rgba(168,85,247,0.13) 100%)", border: "1px solid rgba(167,139,250,0.28)", boxShadow: "0 0 0 1px rgba(139,92,246,0.08), 0 4px 24px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", position: "relative", overflow: "hidden" }}
      onClick={(e) => e.stopPropagation()}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.55) 40%, rgba(216,180,254,0.7) 60%, transparent 100%)" }} />
      <div className="flex items-center gap-2 mb-2">
        <div style={{ width: 26, height: 26, borderRadius: 8, background: "rgba(139,92,246,0.2)", border: "1px solid rgba(167,139,250,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(196,181,253,0.6)", lineHeight: 1, marginBottom: 1 }}>Delivery Verification Code</p>
          <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.3)", lineHeight: 1 }}>Share this code with the delivery agent</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: 26, fontWeight: 800, letterSpacing: "0.22em", color: "#e9d5ff", textShadow: "0 0 20px rgba(167,139,250,0.55), 0 0 40px rgba(139,92,246,0.3)", lineHeight: 1, userSelect: "all" }}>{code}</span>
        <button onClick={handleCopy} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, background: copied ? "rgba(34,197,94,0.15)" : "rgba(139,92,246,0.18)", border: copied ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(167,139,250,0.3)", color: copied ? "#4ade80" : "#c4b5fd", cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "all 0.2s", letterSpacing: "0.02em" }}>
          {copied
            ? (<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Copied</>)
            : (<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy</>)}
        </button>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonOrder() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(21,23,35,0.9), rgba(14,19,32,0.9))", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
      {[1, 2].map((i) => (
        <div key={i} className="p-4 flex gap-3" style={{ borderBottom: i === 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
          <div className="w-16 h-16 rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.05)", animation: "shimmer 1.5s ease-in-out infinite" }} />
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <div style={{ height: 10, width: "55%", borderRadius: 5, background: "rgba(255,255,255,0.05)", animation: "shimmer 1.5s ease-in-out infinite" }} />
            <div style={{ height: 9, width: "35%", borderRadius: 5, background: "rgba(255,255,255,0.04)", animation: "shimmer 1.5s ease-in-out infinite" }} />
            <div style={{ height: 9, width: "25%", borderRadius: 5, background: "rgba(255,255,255,0.04)", animation: "shimmer 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Image Popup ───────────────────────────────────────────────────────────────
function ImagePopup({ src, alt, onClose }) {
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)" }} onClick={onClose}>
      <div style={{ position: "relative", maxWidth: 520, width: "100%", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }} onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={alt} style={{ width: "100%", objectFit: "contain", maxHeight: "80vh", display: "block" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontSize: 14 }}>✕</button>
      </div>
    </div>,
    document.body
  );
}

// ── Cancel Popup ──────────────────────────────────────────────────────────────
function CancelPopup({ order, onClose, onConfirm, loading }) {
  const [selected, setSelected] = useState("");
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.82)", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: 460, margin: "0 16px", background: "linear-gradient(160deg, rgba(21,23,35,0.98), rgba(14,19,32,0.98))", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 18, padding: 26, boxShadow: "0 28px 70px rgba(0,0,0,0.75)", backdropFilter: "blur(24px)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h3 style={{ color: "#fff", fontSize: 17, fontWeight: 700, margin: 0 }}>Cancel Order</h3>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 3 }}>Order #{order.orderId}</p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.35)", background: "none", border: "none", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 0 }}>✕</button>
        </div>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginBottom: 14 }}>Please tell us why you want to cancel:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {CANCEL_REASONS.map((reason) => (
            <button key={reason} onClick={() => setSelected(reason)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 14px", borderRadius: 10, textAlign: "left", background: selected === reason ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.03)", border: selected === reason ? "1px solid rgba(139,92,246,0.45)" : "1px solid rgba(255,255,255,0.06)", color: selected === reason ? "#c4b5fd" : "rgba(255,255,255,0.52)", cursor: "pointer", width: "100%", transition: "all 0.18s" }}>
              <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", border: selected === reason ? "2px solid #a78bfa" : "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {selected === reason && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#a78bfa", display: "block" }} />}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{reason}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.09)", cursor: "pointer" }}>Keep Order</button>
          <button onClick={() => selected && !loading && onConfirm(selected)} disabled={!selected || loading} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13, fontWeight: 600, background: selected && !loading ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "rgba(239,68,68,0.12)", color: selected ? "#fff" : "rgba(255,255,255,0.28)", border: "none", cursor: selected && !loading ? "pointer" : "not-allowed", transition: "all 0.18s" }}>{loading ? "Cancelling…" : "Confirm Cancel"}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ rating, onChange, size = 28 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || rating);
        return (
          <button key={star} onClick={() => onChange(star)} onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 2, transition: "transform 0.15s", transform: hovered === star ? "scale(1.2)" : "scale(1)" }}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#facc15" : "none"} stroke={filled ? "#facc15" : "rgba(255,255,255,0.2)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ filter: filled ? "drop-shadow(0 0 6px rgba(250,204,21,0.5))" : "none", transition: "all 0.15s" }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
        );
      })}
    </div>
  );
}

// ── Image Crop (square) ───────────────────────────────────────────────────────
function ImageCropper({ src, onCrop, onCancel }) {
  const canvasRef    = useRef(null);
  const [drag, setDrag]               = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [imgEl, setImgEl]             = useState(null);
  const [cropBox, setCropBox]         = useState({ x: 0, y: 0, size: 200 });
  const [dragStart, setDragStart]     = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgEl(img);
      const shorter = Math.min(img.naturalWidth, img.naturalHeight);
      const size = shorter * 0.9;
      const x = (img.naturalWidth - size) / 2;
      const y = (img.naturalHeight - size) / 2;
      setCropBox({ x, y, size });
    };
    img.src = src;
  }, [src]);

  const draw = useCallback(() => {
    if (!canvasRef.current || !imgEl) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const scaleX = W / imgEl.naturalWidth, scaleY = H / imgEl.naturalHeight;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(imgEl, 0, 0, W, H);
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    const cx = cropBox.x * scaleX, cy = cropBox.y * scaleY;
    const cs = cropBox.size * Math.min(scaleX, scaleY);
    ctx.fillRect(0, 0, W, cy);
    ctx.fillRect(0, cy + cs, W, H - cy - cs);
    ctx.fillRect(0, cy, cx, cs);
    ctx.fillRect(cx + cs, cy, W - cx - cs, cs);
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cs, cs);
    const hSize = 10;
    ctx.fillStyle = "#a78bfa";
    [[cx, cy], [cx + cs - hSize, cy], [cx, cy + cs - hSize], [cx + cs - hSize, cy + cs - hSize]].forEach(([hx, hy]) => {
      ctx.fillRect(hx, hy, hSize, hSize);
    });
  }, [imgEl, cropBox]);

  useEffect(() => { draw(); }, [draw]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * (canvas.width / rect.width), y: (clientY - rect.top) * (canvas.height / rect.height) };
  };

  const handleMouseDown = (e) => {
    if (!canvasRef.current || !imgEl) return;
    const pos = getPos(e, canvasRef.current);
    const scale = Math.min(canvasRef.current.width / imgEl.naturalWidth, canvasRef.current.height / imgEl.naturalHeight);
    const cx = cropBox.x * scale, cy = cropBox.y * scale, cs = cropBox.size * scale, hs = 20;
    if (pos.x >= cx - hs && pos.x <= cx + hs && pos.y >= cy - hs && pos.y <= cy + hs) { setResizeHandle("tl"); return; }
    if (pos.x >= cx + cs - hs && pos.x <= cx + cs + hs && pos.y >= cy + cs - hs && pos.y <= cy + cs + hs) { setResizeHandle("br"); return; }
    if (pos.x >= cx && pos.x <= cx + cs && pos.y >= cy && pos.y <= cy + cs) { setDrag(true); setDragStart({ mx: pos.x, my: pos.y, ox: cropBox.x, oy: cropBox.y }); }
  };

  const handleMouseMove = (e) => {
    if (resizeHandle && imgEl) {
      const pos = getPos(e, canvasRef.current);
      const scale = Math.min(canvasRef.current.width / imgEl.naturalWidth, canvasRef.current.height / imgEl.naturalHeight);
      const minSize = 100;
      if (resizeHandle === "br") {
        const newSize = Math.max(minSize, Math.min(pos.x / scale - cropBox.x, pos.y / scale - cropBox.y, Math.min(imgEl.naturalWidth, imgEl.naturalHeight)));
        setCropBox(prev => ({ ...prev, size: newSize }));
      }
      if (resizeHandle === "tl") {
        const newSize = cropBox.size + (cropBox.x - pos.x / scale);
        if (newSize > minSize) { setCropBox(prev => ({ x: prev.x - (newSize - prev.size), y: prev.y - (newSize - prev.size), size: newSize })); }
      }
      return;
    }
    if (!drag || !dragStart || !imgEl) return;
    const pos = getPos(e, canvasRef.current);
    const scale = Math.min(canvasRef.current.width / imgEl.naturalWidth, canvasRef.current.height / imgEl.naturalHeight);
    const dx = (pos.x - dragStart.mx) / scale, dy = (pos.y - dragStart.my) / scale;
    const newX = Math.max(0, Math.min(imgEl.naturalWidth - cropBox.size, dragStart.ox + dx));
    const newY = Math.max(0, Math.min(imgEl.naturalHeight - cropBox.size, dragStart.oy + dy));
    setCropBox(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => { setDrag(false); setResizeHandle(null); setDragStart(null); };

  const handleCropConfirm = () => {
    if (!imgEl) return;
    const out = document.createElement("canvas");
    out.width = 400; out.height = 400;
    const ctx = out.getContext("2d");
    ctx.drawImage(imgEl, cropBox.x, cropBox.y, cropBox.size, cropBox.size, 0, 0, 400, 400);
    onCrop(out.toDataURL("image/jpeg", 0.92));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, textAlign: "center" }}>Drag the box to reposition · Square crop</p>
      <div ref={containerRef} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(167,139,250,0.25)", touchAction: "none" }}>
        <canvas ref={canvasRef} width={800} height={imgEl ? (imgEl.naturalHeight / imgEl.naturalWidth) * 800 : 700}
          style={{ width: "100%", height: "auto", display: "block", cursor: resizeHandle ? "nwse-resize" : drag ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>Retake</button>
        <button onClick={handleCropConfirm} style={{ flex: 2, padding: "9px 0", borderRadius: 10, fontSize: 12, fontWeight: 600, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}>Use this crop</button>
      </div>
    </div>
  );
}

// ── Return Popup ──────────────────────────────────────────────────────────────
function ReturnPopup({ order, customerId, onClose, onSuccess }) {
  const [selectedCause, setSelectedCause] = useState("");
  const [rawImageSrc, setRawImageSrc]     = useState(null);
  const [croppedImage, setCroppedImage]   = useState(null);
  const [showCropper, setShowCropper]     = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);

  const galleryInputId = useRef(`return-gallery-${Math.random().toString(36).slice(2)}`);
  const cameraInputId  = useRef(`return-camera-${Math.random().toString(36).slice(2)}`);

  const productThumb = order?.product?.thumbnail ? imageUrl(order.product.thumbnail) : null;
  const productName  = order?.product?.name || "Product";

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => { setRawImageSrc(ev.target.result); setShowCropper(true); setCroppedImage(null); };
    reader.readAsDataURL(file);
  };

  const isValid = selectedCause !== "";

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        orderId:     order.orderId,
        customerId,
        productId:   order.product?.productId,
        returnCause: selectedCause,
        returnImage: croppedImage || null,
      };
      const res = await API.post("/productBuy/submitReturn", payload);
      if (res.data.success) {
        setSubmitted(true);
        onSuccess(order.orderId); // notify parent to update local state
      } else {
        console.error("Return submission failed:", res.data.message);
      }
    } catch (err) {
      console.error("ReturnPopup submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      {/* Hidden file inputs */}
      <input id={galleryInputId.current} type="file" accept="image/*"
        style={{ position: "fixed", top: -9999, left: -9999, opacity: 0, pointerEvents: "none" }}
        onChange={handleFileChange} />
      <input id={cameraInputId.current} type="file" accept="image/*" capture="environment"
        style={{ position: "fixed", top: -9999, left: -9999, opacity: 0, pointerEvents: "none" }}
        onChange={handleFileChange} />

      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.78)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
        onClick={onClose}>
        {/* Sheet */}
        <div style={{ width: "100%", maxWidth: 520, maxHeight: "100dvh", height: "100dvh", background: "linear-gradient(180deg, rgba(18,10,28,0.98) 0%, rgba(10,6,20,0.99) 100%)", border: "1px solid rgba(251,146,60,0.15)", borderRadius: 0, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 -20px 80px rgba(251,146,60,0.12)", position: "relative" }}
          onClick={(e) => e.stopPropagation()}>

          {/* Top shimmer */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(251,146,60,0.6) 30%, rgba(253,186,116,0.8) 50%, rgba(251,146,60,0.6) 70%, transparent)", zIndex: 1 }} />

          {/* Header */}
          <div style={{ padding: "20px 20px 14px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ color: "#f0f0f5", fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                  {submitted ? "Return Requested!" : "Return Product"}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 3 }}>Order #{order.orderId}</p>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✕</button>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 24 }}>
            {submitted ? (
              /* ── Success State ── */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, paddingBottom: 40 }}>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: "rgba(251,146,60,0.12)", border: "1.5px solid rgba(251,146,60,0.4)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(251,146,60,0.2)" }}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p style={{ color: "#fb923c", fontSize: 17, fontWeight: 700 }}>Return Initiated</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, textAlign: "center", maxWidth: 260 }}>
                  Your return request has been submitted. Our team will review and get back to you shortly.
                </p>
                <div style={{ background: "rgba(251,146,60,0.07)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 12, padding: "12px 18px", textAlign: "center" }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Return Cause</p>
                  <p style={{ color: "#fb923c", fontSize: 13, fontWeight: 600 }}>{selectedCause}</p>
                </div>
                <button onClick={onClose} style={{ marginTop: 8, padding: "10px 28px", borderRadius: 99, background: "linear-gradient(135deg, #ea580c, #c2410c)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(234,88,12,0.35)" }}>Close</button>
              </div>
            ) : (
              <>
                {/* Product preview */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "4px 0" }}>
                  {productThumb ? (
                    <div style={{ width: 62, height: 62, borderRadius: 14, overflow: "hidden", border: "1.5px solid rgba(251,146,60,0.22)", flexShrink: 0, boxShadow: "0 4px 16px rgba(251,146,60,0.15)" }}>
                      <img src={productThumb} alt={productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{ width: 62, height: 62, borderRadius: 14, background: "rgba(251,146,60,0.07)", border: "1.5px dashed rgba(251,146,60,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(251,146,60,0.4)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  )}
                  <div>
                    <p style={{ color: "#f0f0f5", fontSize: 13, fontWeight: 600, marginBottom: 3, lineHeight: 1.3 }}>{productName}</p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Select a reason for your return below</p>
                  </div>
                </div>

                {/* Info banner */}
                <div style={{ background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.18)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p style={{ color: "rgba(251,146,60,0.8)", fontSize: 11.5, lineHeight: 1.5 }}>
                    Returns are processed within 3–5 business days. Please provide an image of the product if possible to speed up the review.
                  </p>
                </div>

                {/* ── Return Cause ── */}
                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                    Return Reason <span style={{ color: "#f87171" }}>*</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {RETURN_CAUSES.map((cause) => (
                      <button key={cause} onClick={() => setSelectedCause(cause)}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 11, textAlign: "left", background: selectedCause === cause ? "rgba(251,146,60,0.1)" : "rgba(255,255,255,0.03)", border: selectedCause === cause ? "1px solid rgba(251,146,60,0.45)" : "1px solid rgba(255,255,255,0.06)", color: selectedCause === cause ? "#fdba74" : "rgba(255,255,255,0.52)", cursor: "pointer", width: "100%", transition: "all 0.18s" }}>
                        <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", border: selectedCause === cause ? "2px solid #fb923c" : "2px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {selectedCause === cause && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fb923c", display: "block" }} />}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{cause}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Product Image (optional) ── */}
                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                    Product Photo <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: 10 }}>(optional — helps speed up review)</span>
                  </label>

                  {!croppedImage && !showCropper && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <label htmlFor={galleryInputId.current} onClick={(e) => e.stopPropagation()}
                        style={{ padding: "16px 10px", borderRadius: 12, background: "rgba(251,146,60,0.06)", border: "1px dashed rgba(251,146,60,0.28)", color: "#fdba74", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, transition: "all 0.18s", userSelect: "none" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                        </svg>
                        From Gallery
                      </label>
                      <label htmlFor={cameraInputId.current} onClick={(e) => e.stopPropagation()}
                        style={{ padding: "16px 10px", borderRadius: 12, background: "rgba(234,88,12,0.06)", border: "1px dashed rgba(234,88,12,0.28)", color: "#fb923c", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, transition: "all 0.18s", userSelect: "none" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                        </svg>
                        Take Photo
                      </label>
                    </div>
                  )}

                  {rawImageSrc && showCropper && !croppedImage && (
                    <ImageCropper
                      src={rawImageSrc}
                      onCrop={(dataUrl) => { setCroppedImage(dataUrl); setShowCropper(false); }}
                      onCancel={() => { setRawImageSrc(null); setShowCropper(false); }}
                    />
                  )}

                  {croppedImage && (
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <img src={croppedImage} alt="return" style={{ width: "100%", maxWidth: 180, height: 180, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(251,146,60,0.3)", display: "block" }} />
                      <button onClick={() => { setCroppedImage(null); setRawImageSrc(null); setShowCropper(false); }}
                        style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✕</button>
                      <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(251,146,60,0.85)", borderRadius: 6, padding: "2px 7px", fontSize: 9, fontWeight: 700, color: "#fff" }}>✓ Added</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!submitted && (
            <div style={{ padding: "14px 20px 20px", flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={handleSubmit} disabled={!isValid || submitting}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, fontSize: 14, fontWeight: 700, background: isValid && !submitting ? "linear-gradient(135deg, #ea580c 0%, #c2410c 50%, #9a3412 100%)" : "rgba(251,146,60,0.1)", color: isValid ? "#fff" : "rgba(255,255,255,0.22)", border: isValid ? "none" : "1px solid rgba(251,146,60,0.15)", cursor: isValid && !submitting ? "pointer" : "not-allowed", transition: "all 0.22s", boxShadow: isValid && !submitting ? "0 4px 20px rgba(234,88,12,0.4)" : "none", letterSpacing: "0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {submitting ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 0 1 0 8h-1"/>
                    </svg>
                    Submit Return Request
                  </>
                )}
              </button>
            </div>
          )}

          <style>{`
            @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(251,146,60,0.2); border-radius: 2px; }
          `}</style>
        </div>
      </div>
    </>,
    document.body
  );
}

// ── Feedback Popup ────────────────────────────────────────────────────────────
function FeedbackPopup({ order, onClose, onSubmit, customerId }) {
  const [feedbackType, setFeedbackType]   = useState("");
  const [rating, setRating]               = useState(0);
  const [title, setTitle]                 = useState("");
  const [description, setDescription]     = useState("");
  const [imageComment, setImageComment]   = useState("");
  const [rawImageSrc, setRawImageSrc]     = useState(null);
  const [croppedImage, setCroppedImage]   = useState(null);
  const [showCropper, setShowCropper]     = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);

  const galleryInputId = useRef(`feedback-gallery-${Math.random().toString(36).slice(2)}`);
  const cameraInputId  = useRef(`feedback-camera-${Math.random().toString(36).slice(2)}`);

  const productThumb = order?.product?.thumbnail ? imageUrl(order.product.thumbnail) : null;
  const productName  = order?.product?.name || "Product";
  const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => { setRawImageSrc(ev.target.result); setShowCropper(true); setCroppedImage(null); };
    reader.readAsDataURL(file);
  };

  const isValid = () => {
    if (!feedbackType || rating === 0) return false;
    if (feedbackType === "comment") return title.trim() && description.trim();
    if (feedbackType === "image")   return croppedImage && imageComment.trim();
    return false;
  };

  const handleSubmitFeedback = async () => {
    if (!isValid()) return;
    setSubmitting(true);
    try {
      const payload = {
        orderId: order.orderId, productId: order.product?.productId, customerId,
        feedbackType, rating,
        ...(feedbackType === "comment" && { title, description }),
        ...(feedbackType === "image"   && { croppedImage, imageComment }),
      };
      const res = await API.post("/user/submitFeedback", payload);
      if (res.data.success) setSubmitted(true);
      else console.error("Feedback submission failed:", res.data.message);
    } catch (err) { console.error("handleSubmitFeedback error:", err); }
    finally { setSubmitting(false); }
  };

  const inputStyle = { width: "100%", padding: "10px 13px", borderRadius: 10, fontSize: 13, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#f0f0f5", outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border 0.18s" };

  return createPortal(
    <>
      <input id={galleryInputId.current} type="file" accept="image/*" style={{ position: "fixed", top: -9999, left: -9999, opacity: 0, pointerEvents: "none" }} onChange={handleFileChange} />
      <input id={cameraInputId.current} type="file" accept="image/*" capture="environment" style={{ position: "fixed", top: -9999, left: -9999, opacity: 0, pointerEvents: "none" }} onChange={handleFileChange} />

      <div style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }} onClick={onClose}>
        <div style={{ width: "100%", maxWidth: 520, maxHeight: "100dvh", height: "100dvh", background: "linear-gradient(180deg, rgba(15,12,28,0.97) 0%, rgba(10,8,20,0.99) 100%)", border: "1px solid rgba(167,139,250,0.13)", borderRadius: 0, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 -20px 80px rgba(139,92,246,0.2)", position: "relative" }}
          onClick={(e) => e.stopPropagation()}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6) 30%, rgba(216,180,254,0.8) 50%, rgba(167,139,250,0.6) 70%, transparent)", zIndex: 1 }} />

          <div style={{ padding: "20px 20px 14px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ color: "#f0f0f5", fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>{submitted ? "Feedback Sent!" : "Give Feedback"}</h3>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 3 }}>Order #{order.orderId}</p>
              </div>
              <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✕</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 22 }}>
            {submitted ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, paddingBottom: 40 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "1.5px solid rgba(34,197,94,0.35)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(34,197,94,0.2)" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p style={{ color: "#4ade80", fontSize: 17, fontWeight: 700 }}>Thank you!</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, textAlign: "center" }}>Your feedback helps us improve your experience.</p>
                <button onClick={onClose} style={{ marginTop: 8, padding: "10px 28px", borderRadius: 99, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>Close</button>
              </div>
            ) : (
              <>
                {!feedbackType && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "10px 0 4px", animation: "fadeSlideIn 0.25s ease" }}>
                    {productThumb ? (
                      <div style={{ position: "relative" }}>
                        <div style={{ width: 110, height: 110, borderRadius: 20, overflow: "hidden", border: "1.5px solid rgba(167,139,250,0.25)", boxShadow: "0 8px 32px rgba(139,92,246,0.25), 0 0 0 6px rgba(139,92,246,0.06)" }}>
                          <img src={productThumb} alt={productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)", background: "rgba(34,197,94,0.18)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80", fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap", letterSpacing: "0.06em" }}>✓ DELIVERED</div>
                      </div>
                    ) : (
                      <div style={{ width: 110, height: 110, borderRadius: 20, background: "rgba(139,92,246,0.09)", border: "1.5px dashed rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                    )}
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: "#f0f0f5", fontSize: 13, fontWeight: 600, marginBottom: 4, maxWidth: 240 }}>{productName}</p>
                      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>How was your experience with this product?</p>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(250,204,21,0.2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: -6 }}>Select a feedback type below to get started</p>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Feedback Type</label>
                  <div className="flex gap-3">
                    <button onClick={() => setFeedbackType("comment")} className={`flex items-center gap-2 px-4 py-3 rounded-lg ${feedbackType === "comment" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                      <IoChatboxEllipses size={18} />Add Feedback Comment
                    </button>
                    <button onClick={() => setFeedbackType("image")} className={`flex items-center gap-2 px-4 py-3 rounded-lg ${feedbackType === "image" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300"}`}>
                      <FaImage size={18} />Upload Image
                    </button>
                  </div>
                </div>

                {feedbackType === "comment" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeSlideIn 0.25s ease" }}>
                    <div>
                      <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Review Title</label>
                      <input type="text" placeholder="Summarise your experience…" value={title} onChange={(e) => setTitle(e.target.value)} style={{ ...inputStyle }}
                        onFocus={(e) => e.target.style.borderColor = "rgba(167,139,250,0.45)"} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Description</label>
                      <textarea placeholder="Tell us more about your experience…" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ ...inputStyle }}
                        onFocus={(e) => e.target.style.borderColor = "rgba(167,139,250,0.45)"} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
                    </div>
                  </div>
                )}

                {feedbackType === "image" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeSlideIn 0.25s ease" }}>
                    <div>
                      <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Product Photo</label>
                      {!croppedImage && !showCropper && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <label htmlFor={galleryInputId.current} onClick={(e) => e.stopPropagation()} style={{ padding: "16px 10px", borderRadius: 12, background: "rgba(139,92,246,0.07)", border: "1px dashed rgba(139,92,246,0.3)", color: "#c4b5fd", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, transition: "all 0.18s", userSelect: "none" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            From Gallery
                          </label>
                          <label htmlFor={cameraInputId.current} onClick={(e) => e.stopPropagation()} style={{ padding: "16px 10px", borderRadius: 12, background: "rgba(99,102,241,0.07)", border: "1px dashed rgba(99,102,241,0.3)", color: "#a5b4fc", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, transition: "all 0.18s", userSelect: "none" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            Take Photo
                          </label>
                        </div>
                      )}
                      {rawImageSrc && showCropper && !croppedImage && (
                        <ImageCropper src={rawImageSrc} onCrop={(dataUrl) => { setCroppedImage(dataUrl); setShowCropper(false); }} onCancel={() => { setRawImageSrc(null); setShowCropper(false); }} />
                      )}
                      {croppedImage && (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img src={croppedImage} alt="cropped" style={{ width: "100%", maxWidth: 180, height: 180, objectFit: "cover", borderRadius: 12, border: "1px solid rgba(167,139,250,0.3)", display: "block" }} />
                          <button onClick={() => { setCroppedImage(null); setRawImageSrc(null); setShowCropper(false); }}
                            style={{ position: "absolute", top: 6, right: 6, width: 24, height: 24, borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✕</button>
                          <div style={{ position: "absolute", bottom: 6, left: 6, background: "rgba(34,197,94,0.85)", borderRadius: 6, padding: "2px 7px", fontSize: 9, fontWeight: 700, color: "#fff" }}>✓ Cropped</div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Comment about the Image</label>
                      <textarea placeholder="Describe what's shown in the photo…" value={imageComment} onChange={(e) => setImageComment(e.target.value)} rows={3} style={{ ...inputStyle }}
                        onFocus={(e) => e.target.style.borderColor = "rgba(167,139,250,0.45)"} onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.09)"} />
                    </div>
                  </div>
                )}

                {feedbackType && (
                  <div style={{ animation: "fadeSlideIn 0.25s ease" }}>
                    <label style={{ display: "block", color: "rgba(255,255,255,0.45)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Overall Rating <span style={{ color: "#f87171" }}>*</span></label>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <StarRating rating={rating} onChange={setRating} size={32} />
                      {rating > 0 && <span style={{ fontSize: 13, fontWeight: 600, color: ["","#f87171","#fb923c","#facc15","#a3e635","#4ade80"][rating], transition: "color 0.2s" }}>{ratingLabels[rating]}</span>}
                    </div>
                    {rating === 0 && <p style={{ marginTop: 6, fontSize: 10, color: "rgba(251,146,60,0.7)" }}>Rating is required to submit feedback</p>}
                  </div>
                )}
              </>
            )}
          </div>

          {!submitted && (
            <div style={{ padding: "14px 20px 20px", flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <button onClick={handleSubmitFeedback} disabled={!isValid() || submitting}
                style={{ width: "100%", padding: "13px 0", borderRadius: 12, fontSize: 14, fontWeight: 700, background: isValid() && !submitting ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)" : "rgba(139,92,246,0.1)", color: isValid() ? "#fff" : "rgba(255,255,255,0.22)", border: isValid() ? "none" : "1px solid rgba(139,92,246,0.15)", cursor: isValid() && !submitting ? "pointer" : "not-allowed", transition: "all 0.22s", boxShadow: isValid() && !submitting ? "0 4px 20px rgba(124,58,237,0.4)" : "none", letterSpacing: "0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {submitting ? (
                  <><svg style={{ animation: "spin 1s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Submitting…</>
                ) : (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Add Feedback</>
                )}
              </button>
            </div>
          )}

          <style>{`
            @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            select option { background: #0f0c1c !important; }
            textarea, input[type="text"] { color-scheme: dark; }
            ::-webkit-scrollbar { width: 4px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.2); border-radius: 2px; }
          `}</style>
        </div>
      </div>
    </>,
    document.body
  );
}

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onCancelClick, customerId, onReturnSuccess }) {
  const navigate = useNavigate();
  const [expanded, setExpanded]       = useState(false);
  const [popupImg, setPopupImg]       = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showReturn, setShowReturn]   = useState(false);

  const p            = order.product;
  const thumb        = p?.thumbnail ? imageUrl(p.thumbnail) : null;
  const stateClr     = STATE_COLORS[order.orderState] || STATE_COLORS.PLACED;
  const isCancelled  = order.orderState === "CANCELLED";
  const isDelivered  = order.orderState === "DELIVERED";
  const isShipped    = order.orderState === "SHIPPED";
  const isReturned   = order.orderState === "RETURNED";

  const showCancelButton = !isCancelled && !isDelivered && !isShipped && !isReturned;
  const deliveryCode     = order.deliveryCode?.code;
  const showDeliveryCode = isShipped && deliveryCode && deliveryCode.trim() !== "";

  // Return button only for DELIVERED orders that don't already have a return
  const showReturnButton = isDelivered && !order.returnInfo;

  const goToProduct = (e) => {
    if (e.target.closest("button") || e.target.closest("a") || e.target.closest("label")) return;
    if (!p?.productId) return;
    navigate(`/product-view/${encodeProductId(p.productId)}`);
  };

  const handleOrderAgain = (e) => {
    e.stopPropagation();
    if (!p?.productId) return;
    navigate(`/product-view/${encodeProductId(p.productId)}`);
  };

  return (
    <>
      <div className="rounded-2xl overflow-hidden transition-all duration-300"
        style={{ background: "linear-gradient(145deg, rgba(21,23,35,0.85) 0%, #0B0F1A 100%)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)", cursor: "pointer" }}
        onClick={goToProduct}>

        {/* Main Row */}
        <div className="p-4 flex gap-3 items-start">
          <div className="shrink-0 rounded-xl overflow-hidden" style={{ width: 68, height: 68, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>
            {thumb
              ? <img src={thumb} alt={p?.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)", fontSize: 9 }}>No img</div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="font-semibold leading-snug line-clamp-2" style={{ color: "#f0f0f5", fontFamily: "'Poppins', sans-serif", fontSize: 13.5, maxWidth: "66%" }}>
                {p?.name || "Product Unavailable"}
              </p>
              <span className="font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{ background: stateClr.bg, border: `1px solid ${stateClr.border}`, color: stateClr.text, fontSize: 9, letterSpacing: "0.08em" }}>
                {order.orderState}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {order.size && <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>Size <span style={{ color: "#a78bfa", fontWeight: 600 }}>{order.size}</span></span>}
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>Qty <span style={{ color: "#a78bfa", fontWeight: 600 }}>{order.quantity}</span></span>
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>{fmtDate(order.orderDate)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span style={{ color: "#4ade80", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14 }}>{fmt(order.totalPrice)}</span>
              {order.deliveryCharge === 0
                ? <span style={{ background: "rgba(34,197,94,0.08)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)", fontSize: 9, padding: "1px 7px", borderRadius: 99, fontWeight: 600 }}>FREE Delivery</span>
                : <span style={{ color: "rgba(255,255,255,0.28)", fontSize: 10 }}>+ {fmt(order.deliveryCharge)} delivery</span>
              }
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <OrderProgressBar state={order.orderState} />
        </div>

        {/* Return info banner (if already returned) */}
        {isReturned && order.returnInfo && (
          <div style={{ margin: "0 16px 14px", borderRadius: 12, padding: "12px 16px", background: "rgba(251,146,60,0.07)", border: "1px solid rgba(251,146,60,0.2)", display: "flex", gap: 10, alignItems: "flex-start" }}
            onClick={(e) => e.stopPropagation()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 0 1 0 8h-1"/>
            </svg>
            <div>
              <p style={{ color: "#fb923c", fontSize: 11, fontWeight: 700, marginBottom: 2 }}>Return Requested — {order.returnInfo.returnStatus}</p>
              <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 11 }}>{order.returnInfo.returnCause}</p>
            </div>
          </div>
        )}

        {/* Delivery Code */}
        {showDeliveryCode && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 14 }}>
            <DeliveryCodeBanner code={deliveryCode} />
          </div>
        )}

        {/* Action Bar */}
        <div className="px-4 py-2.5 flex items-center gap-2 flex-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} onClick={(e) => e.stopPropagation()}>
          <button onClick={handleOrderAgain} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(139,92,246,0.28)", color: "#c4b5fd", cursor: "pointer", fontSize: 11 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Order Again
          </button>

          {showCancelButton && (
            <button onClick={(e) => { e.stopPropagation(); onCancelClick(order); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", cursor: "pointer", fontSize: 11 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              Cancel Order
            </button>
          )}

          {/* Return button — only for DELIVERED, no prior return */}
          {showReturnButton && (
            <button onClick={(e) => { e.stopPropagation(); setShowReturn(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
              style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.25)", color: "#fb923c", cursor: "pointer", fontSize: 11 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M9 14l-4-4 4-4"/><path d="M5 10h11a4 4 0 0 1 0 8h-1"/>
              </svg>
              Return Product
            </button>
          )}

          {isDelivered && (
            <button onClick={(e) => { e.stopPropagation(); setShowFeedback(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all duration-200"
              style={{ background: "rgba(250,204,21,0.07)", border: "1px solid rgba(250,204,21,0.22)", color: "#facc15", cursor: "pointer", fontSize: 11 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Give Feedback
            </button>
          )}

          <button onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }} className="ml-auto flex items-center gap-1 font-medium transition-all"
            style={{ color: "rgba(255,255,255,0.28)", background: "none", border: "none", cursor: "pointer", fontSize: 10 }}>
            {expanded ? "Hide details" : "Show details"}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        {/* Expandable Details */}
        <div style={{ maxHeight: expanded ? 700 : 0, overflow: "hidden", transition: "max-height 0.38s cubic-bezier(0.4,0,0.2,1)" }} onClick={(e) => e.stopPropagation()}>
          {p && (
            <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              {p.images && p.images.length > 0 && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  {p.images.map((img, idx) => {
                    const src = imageUrl(img);
                    return (
                      <div key={idx} className="shrink-0 rounded-xl overflow-hidden" style={{ width: 64, height: 64, border: "1px solid rgba(255,255,255,0.08)", cursor: "zoom-in" }} onClick={() => setPopupImg(src)}>
                        <img src={src} alt={`img-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-5 gap-y-2 mb-2">
                {[
                  { label: "Category",     value: p.category },
                  { label: "Sub-Category", value: p.subCategory || "—" },
                  { label: "MRP",          value: fmt(p.price) },
                  { label: "Discount",     value: p.discount > 0 ? `${p.discount}% OFF` : "None" },
                  { label: "Final Price",  value: fmt(p.finalPrice) },
                  { label: "Est. Delivery",value: p.estimatedDelivery },
                  ...(p.color ? [{ label: "Color", value: p.color.name }] : []),
                ].map((row) => (
                  <div key={row.label}>
                    <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>{row.label}</p>
                    <p style={{ color: "rgba(255,255,255,0.68)", fontSize: 12, fontWeight: 600 }}>{row.value}</p>
                  </div>
                ))}
              </div>
              {p.details && p.details.length > 0 && (
                <>
                  <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "10px 0" }} />
                  <div className="flex flex-col gap-1.5">
                    {p.details.map((d, i) => (
                      <div key={i} className="flex gap-2" style={{ fontSize: 11 }}>
                        <span style={{ color: "rgba(255,255,255,0.28)", minWidth: 100 }}>{d.field}</span>
                        <span style={{ color: "rgba(255,255,255,0.62)" }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {popupImg && <ImagePopup src={popupImg} alt="product" onClose={() => setPopupImg(null)} />}

      {showFeedback && (
        <FeedbackPopup order={order} customerId={customerId} onClose={() => setShowFeedback(false)} onSubmit={() => {}} />
      )}

      {showReturn && (
        <ReturnPopup
          order={order}
          customerId={customerId}
          onClose={() => setShowReturn(false)}
          onSuccess={(orderId) => {
            setShowReturn(false);
            onReturnSuccess(orderId);
          }}
        />
      )}
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Order() {
  const [orders,      setOrders]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [customerId,  setCustomerId]  = useState(null);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelLoad,  setCancelLoad]  = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = getStoredEmail();
        if (!email) return;
        const res = await API.post("/user/getProfile", { email });
        if (res.data.success) setCustomerId(res.data.user?.customerId || null);
      } catch (err) { console.error("fetchUser error", err); }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!customerId) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/productBuy/getUserOrder/${customerId}`);
        if (res.data.success) setOrders(res.data.data || []);
      } catch (err) { console.error("fetchOrders error", err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [customerId]);

  const handleCancelConfirm = async (reason) => {
    if (!cancelOrder) return;
    setCancelLoad(true);
    try {
      const res = await API.put(`/productBuy/updateOrderStatus/${cancelOrder.orderId}`, { orderState: "CANCELLED", reason });
      if (res.data.success) {
        setOrders((prev) => prev.map((o) =>
          o.orderId === cancelOrder.orderId
            ? { ...o, orderState: "CANCELLED", cancellationReason: reason, cancelledAt: new Date() }
            : o
        ));
        setCancelOrder(null);
      }
    } catch (err) { console.error("cancelOrder error", err); }
    finally { setCancelLoad(false); }
  };

  // Called by OrderCard when a return is submitted successfully
  const handleReturnSuccess = (orderId) => {
    setOrders((prev) => prev.map((o) =>
      o.orderId === orderId
        ? {
            ...o,
            orderState: "RETURNED",
            returnedAt: new Date(),
            returnInfo: { returnStatus: "REQUESTED" },  // optimistic update
          }
        : o
    ));
  };

  return (
    <div style={{ position: "relative" }}>
      <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "#f0f0f5" }}>My Orders</h2>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Track and manage your purchases</p>
      </div>

      {loading && <div className="flex flex-col gap-3"><SkeletonOrder /><SkeletonOrder /></div>}

      {!loading && orders.length === 0 && (
        <div className="rounded-2xl flex flex-col items-center justify-center py-16 gap-4"
          style={{ background: "linear-gradient(145deg, rgba(21,23,35,0.7), rgba(14,19,32,0.8))", border: "1px dashed rgba(255,255,255,0.07)", backdropFilter: "blur(20px)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.09)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.65)" }}>No orders yet</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Your past purchases will appear here</p>
          <a href="/" className="mt-1 px-5 py-2 rounded-full text-xs font-semibold" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", textDecoration: "none", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>Start Shopping</a>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              customerId={customerId}
              onCancelClick={(o) => setCancelOrder(o)}
              onReturnSuccess={handleReturnSuccess}
            />
          ))}
        </div>
      )}

      {cancelOrder && (
        <CancelPopup order={cancelOrder} onClose={() => setCancelOrder(null)} onConfirm={handleCancelConfirm} loading={cancelLoad} />
      )}
    </div>
  );
}