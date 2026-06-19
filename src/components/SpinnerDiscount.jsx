import { useState, useRef, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { FaLock } from "react-icons/fa";
import { API } from "../api";

// ── Wheel segments ─────────────────────────────────────────────────
const SEGMENTS = [
  { label: "5% OFF",      color: "#E8531A", textColor: "#fff",    probability: 0.17 },
  { label: "NO DISCOUNT", color: "#0a0f1e", textColor: "#9ca3af", probability: 0.07 },
  { label: "10% OFF",     color: "#2563EB", textColor: "#fff",    probability: 0.10 },
  { label: "5% OFF",      color: "#d97706", textColor: "#fff",    probability: 0.17 },
  { label: "NO DISCOUNT", color: "#0a0f1e", textColor: "#9ca3af", probability: 0.06 },
  { label: "15% OFF",     color: "#059669", textColor: "#fff",    probability: 0.10 },
  { label: "5% OFF",      color: "#7c3aed", textColor: "#fff",    probability: 0.16 },
  { label: "10% OFF",     color: "#0284c7", textColor: "#fff",    probability: 0.10 },
  { label: "NO DISCOUNT", color: "#0a0f1e", textColor: "#9ca3af", probability: 0.07 },
  { label: "50% OFF",     color: "#be185d", textColor: "#fff",    probability: 0.03 },
];

const TOTAL = SEGMENTS.reduce((s, seg) => s + seg.probability, 0);
const SLICE = 360 / SEGMENTS.length;

// How long a spin "locks" the wheel for, in ms. Must match the backend's
// window in saveDiscount (oneWeekAgo = now - 7 days) — both sides need to
// agree on what "already spun this week" means.
const SPIN_LOCK_MS = 7 * 24 * 60 * 60 * 1000;

const PRIZES = [
  { label: "50% OFF", color: "#be185d", icon: "🔥" },
  { label: "15% OFF", color: "#059669", icon: "✨" },
  { label: "10% OFF", color: "#2563EB", icon: "⚡" },
  { label: "5% OFF",  color: "#d97706", icon: "🎁" },
  { label: "No Discount", color: "#4b5563", icon: "😶" },
];

// ── Helpers ────────────────────────────────────────────────────────
function pickSegment() {
  let r = Math.random() * TOTAL;
  for (let i = 0; i < SEGMENTS.length; i++) {
    r -= SEGMENTS[i].probability;
    if (r <= 0) return i;
  }
  return SEGMENTS.length - 1;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(cx, cy, r, startAngle, endAngle) {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M${cx},${cy} L${s.x},${s.y} A${r},${r},0,${large},1,${e.x},${e.y} Z`;
}

function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

// ── Format countdown ───────────────────────────────────────────────
function formatCountdown(ms) {
  if (ms <= 0) return "now";
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ── Format expiry label ────────────────────────────────────────────
function formatExpiry(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── User from storage ──────────────────────────────────────────────
function getStoredEmail() {
  try {
    const s = localStorage.getItem("user");
    if (s) { const p = JSON.parse(s); if (p?.email) return p.email; }
  } catch (_) {}
  try {
    const c = Cookies.get("user");
    if (c) { const p = JSON.parse(c); if (p?.email) return p.email; }
  } catch (_) {}
  return null;
}

// ── Audio ──────────────────────────────────────────────────────────
function createAudioContext() {
  try { return new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; }
}
function playTick(ctx, pitch = 440) {
  if (!ctx) return;
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(pitch, ctx.currentTime);
  gain.gain.setValueAtTime(0.55, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.05);
}
function playWinSound(ctx) {
  if (!ctx) return;
  [523, 659, 784, 1047].forEach((freq, i) => {
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.13);
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.13);
    gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + i * 0.13 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.13 + 0.25);
    osc.start(ctx.currentTime + i * 0.13); osc.stop(ctx.currentTime + i * 0.13 + 0.3);
  });
}
function playLoseSound(ctx) {
  if (!ctx) return;
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.65, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
  osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
}

// ── Mini Wheel SVG (decorative, for the voucher card) ─────────────
// Always spinning gently via CSS, independent of the main wheel's spin logic.
function MiniWheel({ size = 56 }) {
  const c = size / 2, r = size / 2 - 3;
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        animation: "miniWheelSpin 6s linear infinite",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="mhub" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff9c4" />
            <stop offset="60%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#a07000" />
          </radialGradient>
        </defs>
        {SEGMENTS.map((seg, i) => {
          const start = i * SLICE, end = start + SLICE;
          return <path key={i} d={segmentPath(c, c, r, start, end)} fill={seg.color} stroke="#ffd700" strokeWidth="0.6" />;
        })}
        <circle cx={c} cy={c} r={size * 0.16} fill="url(#mhub)" stroke="#8a6000" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

// ── Voucher Card (ticket-stub design) ───────────────────────────────
// Layout mirrors a physical coupon: a dark perforated-edge stub on the
// left (holds the spinning wheel + vertical "DISCOUNT COUPON" label)
// connected via a dashed tear-line to a light info panel on the right
// (discount %, code, copy button, expiry). Colors are pulled from the
// app's existing dark purple/pink palette instead of the reference's
// navy/white so it sits naturally inside the rest of the UI.
function VoucherCard({ voucher, onCopy, copied, timeLeftMs }) {
  const isUsed    = voucher.isUsed;
  const isExpired = new Date() > new Date(voucher.expiresAt);
  const isValid   = !isUsed && !isExpired;

  const pct = voucher.discountValue;
  const accent = pct >= 50 ? "#be185d" : pct >= 15 ? "#059669" : pct >= 10 ? "#2563EB" : "#d97706";

  // Badge colors: ACTIVE → green, USED → red, EXPIRED → neutral gray.
  const badgeColor = isValid ? "#22c55e" : isUsed ? "#ef4444" : "#9ca3af";
  const badgeLabel = isValid ? "ACTIVE" : isUsed ? "USED" : "EXPIRED";

  const stubBg = isValid
    ? `linear-gradient(160deg, ${accent} 0%, #1e1530 100%)`
    : "linear-gradient(160deg, #2a2a33 0%, #1a1a20 100%)";

  const NOTCH = 14; // radius of the punched semicircle notches on the tear-line

  return (
    <div style={{
      display: "flex",
      borderRadius: 16,
      overflow: "hidden",
      opacity: isValid ? 1 : 0.7,
      boxShadow: isValid ? `0 8px 24px -8px ${accent}55` : "none",
      background: "#13101c",
    }}>

      {/* ── Left stub: ticket edge + spinning wheel + label ── */}
      <div style={{
        position: "relative",
        background: stubBg,
        width: 92,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
      }}>
        {/* Pinking-shear zigzag edge (left side, like a torn ticket stub) */}
        <svg
          width="10" height="100%" viewBox="0 0 10 200" preserveAspectRatio="none"
          style={{ position: "absolute", left: -1, top: 0, height: "100%" }}
        >
          <polygon
            points={Array.from({ length: 21 }, (_, i) => {
              const y = (i / 20) * 200;
              const x = i % 2 === 0 ? 10 : 2;
              return `${x},${y}`;
            }).join(" ") + " 0,200 0,0"}
            fill={isValid ? accent : "#1a1a20"}
            opacity="0.001"
          />
        </svg>

        <div style={{
          opacity: isValid ? 1 : 0.4,
          filter: isValid ? "none" : "grayscale(1)",
        }}>
          <MiniWheel size={46} />
        </div>

        {/* Vertical "DISCOUNT COUPON" label */}
        <div style={{
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          color: isValid ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.15em",
          textAlign: "center",
        }}>
          DISCOUNT COUPON
        </div>
      </div>

      {/* ── Dashed tear-line with punched notches ── */}
      <div style={{
        position: "relative",
        width: 0,
        flexShrink: 0,
        borderLeft: `2px dashed ${isValid ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.12)"}`,
      }}>
        <div style={{
          position: "absolute", top: -NOTCH, left: -NOTCH, width: NOTCH * 2, height: NOTCH * 2,
          borderRadius: "50%", background: "#0E1320",
        }} />
        <div style={{
          position: "absolute", bottom: -NOTCH, left: -NOTCH, width: NOTCH * 2, height: NOTCH * 2,
          borderRadius: "50%", background: "#0E1320",
        }} />
      </div>

      {/* ── Right panel: info + copy ── */}
      <div style={{
        flex: 1,
        minWidth: 0,
        background: isValid
          ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)"
          : "rgba(255,255,255,0.02)",
        padding: "0.9rem 1.1rem",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{
            color: isValid ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)",
            fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            Voucher Shopping
          </span>
          <span style={{
            background: `${badgeColor}22`, color: badgeColor,
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            border: `1px solid ${badgeColor}55`, letterSpacing: "0.08em", flexShrink: 0,
          }}>{badgeLabel}</span>
        </div>

        <span style={{
          color: isValid ? "#fff" : "rgba(255,255,255,0.35)",
          fontWeight: 800,
          fontSize: "1.6rem",
          lineHeight: 1,
        }}>{voucher.discountLabel}</span>

        {/* Code row + copy button */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginTop: 2,
        }}>
          <span style={{
            fontFamily: "monospace",
            fontSize: 12.5,
            fontWeight: 700,
            color: isValid ? "#fbbf24" : "rgba(255,255,255,0.2)",
            letterSpacing: "0.1em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>{voucher.discountId}</span>

          {isValid && (
            <button
              onClick={() => onCopy(voucher.discountId)}
              style={{
                flexShrink: 0,
                background: copied ? `${accent}30` : "rgba(255,255,255,0.07)",
                border: copied ? `1px solid ${accent}60` : "1px solid rgba(255,255,255,0.14)",
                borderRadius: 9,
                color: copied ? accent : "rgba(255,255,255,0.65)",
                fontSize: 11,
                fontWeight: 700,
                padding: "6px 12px",
                cursor: "pointer",
                letterSpacing: "0.05em",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          )}
        </div>

        {/* Expiry / time left */}
        {isValid ? (
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10.5, marginTop: 2 }}>
            THIS VOUCHER VALID UNTIL {formatExpiry(voucher.expiresAt).toUpperCase()}
            {timeLeftMs > 0 && (
              <span style={{ color: accent, fontWeight: 600, marginLeft: 6 }}>
                · {formatCountdown(timeLeftMs)} left
              </span>
            )}
          </div>
        ) : (
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10.5, marginTop: 2 }}>
            {isUsed ? `USED · ISSUED ${formatExpiry(voucher.issuedAt).toUpperCase()}` : `EXPIRED ${formatExpiry(voucher.expiresAt).toUpperCase()}`}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────
export default function SpinnerDiscount() {
  // Voucher / user state
  const [activeVoucher, setActiveVoucher]   = useState(null);   // most recent voucher issued within the lock window (used or not)
  const [allVouchers, setAllVouchers]       = useState([]);
  const [voucherLoading, setVoucherLoading] = useState(true);
  const [customerId, setCustomerId]         = useState(null);
  const [copied, setCopied]                 = useState(false);
  const [timeLeftMs, setTimeLeftMs]         = useState(0);
  const [nextSpinMs, setNextSpinMs]         = useState(0);       // countdown until spin unlocks
  const [spinLocked, setSpinLocked]         = useState(false);   // true once we know the user can't spin this week

  // Spin state
  const [rotation, setRotation]     = useState(0);
  const [spinning, setSpinning]     = useState(false);
  const [result, setResult]         = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [hasSpun, setHasSpun]       = useState(false);
  const [discountId, setDiscountId] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 641 : false
  );

  const animRef       = useRef(null);
  const currentRotRef = useRef(0);
  const audioCtxRef   = useRef(null);
  const lastTickRef   = useRef(0);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 641);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // ── Countdown ticker ────────────────────────────────────────────
  // Lock expiry is "7 days since the most recent voucher was issued" —
  // this matches the backend's rule and is independent of whether the
  // voucher has since been used or whether its own discount has expired.
  useEffect(() => {
    if (!activeVoucher) return;
    const lockExpiresAt = new Date(activeVoucher.issuedAt).getTime() + SPIN_LOCK_MS;
    const voucherExpiresAt = new Date(activeVoucher.expiresAt).getTime();

    const tick = () => {
      const now = Date.now();
      setTimeLeftMs(Math.max(0, voucherExpiresAt - now));
      setNextSpinMs(Math.max(0, lockExpiresAt - now));
      setSpinLocked(lockExpiresAt > now);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [activeVoucher]);

  // ── Load customerId ─────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const email = getStoredEmail();
      if (!email) return;
      try {
        const res = await API.post("/user/getProfile", { email });
        if (res.data.success) setCustomerId(res.data.user?.customerId || null);
      } catch (_) {}
    };
    load();
  }, []);

  // ── Load existing vouchers ──────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const email = getStoredEmail();
      if (!email) { setVoucherLoading(false); return; }
      try {
        const res = await API.get(`/discount/discounts?email=${email}`);
        if (res.data.success) {
          const vouchers = res.data.discounts || [];
          setAllVouchers(vouchers);

          const now = Date.now();

          // The spin lock is about whether a voucher was ISSUED this week,
          // not whether it's still unused/unexpired. A used voucher still
          // counts — otherwise the wheel reappears the moment someone
          // redeems their code, letting them spin again the same week.
          // This mirrors the backend's saveDiscount check:
          //   issuedAt >= now - 7 days
          const recentlyIssued = vouchers
            .filter((v) => now - new Date(v.issuedAt).getTime() < SPIN_LOCK_MS)
            .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));

          const lockingVoucher = recentlyIssued[0] || null;
          setActiveVoucher(lockingVoucher);

          if (lockingVoucher) {
            setHasSpun(true);
            const lockExpiresAt = new Date(lockingVoucher.issuedAt).getTime() + SPIN_LOCK_MS;
            setSpinLocked(lockExpiresAt > now);
            setTimeLeftMs(Math.max(0, new Date(lockingVoucher.expiresAt) - now));
            setNextSpinMs(Math.max(0, lockExpiresAt - now));
          }
        }
      } catch (_) {}
      setVoucherLoading(false);
    };
    load();
  }, []);

  const WS = isMobile ? 270 : 310;
  const cx = WS / 2, cy = WS / 2, R = WS / 2 - 14;

  // ── Copy handler ────────────────────────────────────────────────
  const handleCopy = useCallback((code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  // ── Save discount ───────────────────────────────────────────────
  const saveDiscountToBackend = async (label) => {
    if (label === "NO DISCOUNT") return;
    const email = getStoredEmail();
    if (!email || !customerId) return;
    setSaveStatus("saving");
    try {
      const res = await API.post("/discount/saveDiscount", {
        userEmail: email,
        customerId,
        discountLabel: label,
      });
      if (res.data.success || res.data.alreadyExists) {
        const voucher = res.data.discount;
        setDiscountId(voucher.discountId);
        setActiveVoucher(voucher);
        setSpinLocked(true);
        setAllVouchers((prev) => [voucher, ...prev.filter((v) => v._id !== voucher._id)]);
        setSaveStatus("saved");
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("saveDiscount failed:", err.message);
      setSaveStatus("error");
    }
  };

  // ── Spin ────────────────────────────────────────────────────────
  function spin() {
    if (spinning || hasSpun || spinLocked) return;
    setResult(null);
    setShowResult(false);
    setSaveStatus("idle");
    setDiscountId("");

    if (!audioCtxRef.current) audioCtxRef.current = createAudioContext();
    const ctx = audioCtxRef.current;
    if (ctx?.state === "suspended") ctx.resume();

    const winIndex    = pickSegment();
    const extraSpins  = 6 + Math.floor(Math.random() * 3);
    const segMid      = winIndex * SLICE + SLICE / 2;
    const targetAngle = extraSpins * 360 + (360 - segMid);
    const startRot    = currentRotRef.current;
    const startTime   = performance.now();
    const duration    = 4200 + Math.random() * 800;

    lastTickRef.current = Math.floor(startRot / SLICE);
    setSpinning(true);

    function animate(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const angle    = startRot + easeOut(progress) * targetAngle;
      currentRotRef.current = angle;
      setRotation(angle);

      const currentSeg = Math.floor(angle / SLICE);
      if (currentSeg !== lastTickRef.current) {
        lastTickRef.current = currentSeg;
        const speed     = easeOut(Math.min((elapsed + 16) / duration, 1)) - easeOut(progress);
        const speedNorm = Math.max(0, Math.min(1, speed * 60));
        playTick(ctx, 200 + speedNorm * 600);
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setHasSpun(true);
        const won = SEGMENTS[winIndex];
        setResult(won);
        if (won.label !== "NO DISCOUNT") {
          setTimeout(() => playWinSound(ctx), 350);
          saveDiscountToBackend(won.label);
        } else {
          setTimeout(() => playLoseSound(ctx), 350);
        }
        setTimeout(() => setShowResult(true), 300);
      }
    }
    animRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => () => cancelAnimationFrame(animRef.current), []);

  const isWin = result && result.label !== "NO DISCOUNT";
  const displayCode = discountId || (isWin
    ? `SAVE${result.label.replace("% OFF", "").replace(/\s+/g, "")}-PENDING`
    : "");

  // ── Derived: show spinner or voucher-card view ──────────────────
  // Show the wheel only if nothing has locked the spin for this week.
  // Show the card whenever there's a voucher inside the lock window,
  // whether it's unused, used, or even past its own expiry — the lock
  // window and the voucher's own validity window are different things.
  const showSpinner = !voucherLoading && !activeVoucher && !hasSpun && !spinLocked;
  const pastVouchers = allVouchers.filter(
    (v) => v.isUsed || new Date(v.expiresAt) <= Date.now()
  );

  return (
    <section style={{
      // No forced 100vh — the section now sizes to its actual content.
      // Previously minHeight:"100vh" left a huge empty gap whenever only
      // the (short) locked-voucher card was rendered instead of the wheel.
      background: "#0E1320",
      padding: "2.5rem 1rem 3rem",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span style={{
            display: "inline-block", background: "rgba(236,72,153,0.15)",
            color: "#f472b6", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
            textTransform: "uppercase", padding: "4px 14px", borderRadius: 20,
            border: "1px solid rgba(244,114,182,0.25)", marginBottom: 10,
          }}>Weekly Spin</span>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.3rem,3.5vw,1.9rem)", fontWeight: 700, margin: "0 0 6px", lineHeight: 1.2 }}>
            Spin &amp; Win a Discount Voucher
          </h2>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
            One free spin per week · Up to 50% off your order
          </p>
        </div>

        {/* ── Loading skeleton ── */}
        {voucherLoading && (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #9333ea", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 12px" }} />
            Loading your voucher status…
          </div>
        )}

        {/* ── Already spun this week → show card, lock spinner ── */}
        {!voucherLoading && activeVoucher && (
          <div style={{ maxWidth: 540, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Locked banner */}
            <div style={{
              background: "rgba(147,51,234,0.1)", border: "1px solid rgba(147,51,234,0.3)",
              borderRadius: 12, padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <FaLock size={16} color="#c084fc" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ color: "#c084fc", fontWeight: 700, fontSize: 13 }}>
                  Spin locked · You already spun this week
                </div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 2 }}>
                  Next spin available in <span style={{ color: "#c084fc", fontWeight: 600 }}>{formatCountdown(nextSpinMs)}</span>
                </div>
              </div>
            </div>

            {/* Voucher card from this week's spin */}
            <VoucherCard
              voucher={activeVoucher}
              onCopy={handleCopy}
              copied={copied}
              timeLeftMs={timeLeftMs}
            />

            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center", margin: 0 }}>
              Apply the code at checkout · Valid for 7 days from issue
            </p>
          </div>
        )}

        {/* ── Spin available → show wheel ── */}
        {!voucherLoading && !activeVoucher && (
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : `${WS + 24}px 1fr`,
            gap: "2.5rem",
            alignItems: "center",
          }}>

            {/* Wheel column */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <div style={{ position: "relative", width: WS + 24, height: WS + 24 }}>

                {/* Gold ring */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  boxShadow: "0 0 0 5px #b8860b, 0 0 0 9px #ffd700, 0 0 0 12px #b8860b, 0 0 28px rgba(255,215,0,0.2)",
                  zIndex: 2, pointerEvents: "none",
                }} />

                {/* Bulbs */}
                {[...Array(20)].map((_, i) => {
                  const angle = (i / 20) * 360;
                  const pos   = polarToCartesian(WS / 2 + 12, WS / 2 + 12, WS / 2 + 6, angle);
                  return (
                    <div key={i} style={{
                      position: "absolute", left: pos.x - 4, top: pos.y - 4,
                      width: 8, height: 8, borderRadius: "50%",
                      background: i % 2 === 0 ? "#ffd700" : "#fffde7",
                      boxShadow: "0 0 5px rgba(255,215,0,0.9)",
                      zIndex: 3, pointerEvents: "none",
                    }} />
                  );
                })}

                {/* SVG Wheel */}
                <svg
                  width={WS} height={WS} viewBox={`0 0 ${WS} ${WS}`}
                  style={{ transform: `rotate(${rotation}deg)`, display: "block", borderRadius: "50%", position: "absolute", top: 12, left: 12 }}
                >
                  <defs>
                    <radialGradient id="hub" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fff9c4" />
                      <stop offset="55%" stopColor="#ffd700" />
                      <stop offset="100%" stopColor="#a07000" />
                    </radialGradient>
                  </defs>
                  {SEGMENTS.map((seg, i) => {
                    const start = i * SLICE, end = start + SLICE, mid = start + SLICE / 2;
                    const textR = R * 0.63;
                    const tp    = polarToCartesian(cx, cy, textR, mid);
                    const tAng  = mid - 90;
                    return (
                      <g key={i}>
                        <path d={segmentPath(cx, cy, R, start, end)} fill={seg.color} stroke="#ffd700" strokeWidth="1.2" />
                        <text
                          x={tp.x} y={tp.y}
                          transform={`rotate(${tAng}, ${tp.x}, ${tp.y})`}
                          textAnchor="middle" dominantBaseline="middle"
                          fill={seg.textColor}
                          fontSize={seg.label.length > 7 ? "9.5" : "11.5"}
                          fontWeight="800" fontFamily="Inter, sans-serif"
                          style={{ userSelect: "none" }}
                        >{seg.label}</text>
                      </g>
                    );
                  })}
                  <circle cx={cx} cy={cy} r={24} fill="url(#hub)" stroke="#8a6000" strokeWidth="2" />
                  <circle cx={cx} cy={cy} r={10} fill="rgba(255,255,255,0.5)" />
                </svg>

                {/* Pointer */}
                <div style={{ position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
                  <svg width="22" height="30" viewBox="0 0 22 30">
                    <polygon points="11,30 0,0 22,0" fill="#f43f5e" />
                    <polygon points="11,25 4,5 18,5" fill="#fb7185" opacity="0.55" />
                  </svg>
                </div>
              </div>

              {/* Spin button */}
              <button
                onClick={spin}
                disabled={spinning || hasSpun || spinLocked}
                style={{
                  width: "100%", maxWidth: 220, padding: "12px 0",
                  background: (hasSpun || spinLocked)
                    ? "rgba(255,255,255,0.06)"
                    : spinning
                      ? "rgba(244,63,94,0.5)"
                      : "linear-gradient(135deg, #f43f5e 0%, #9333ea 100%)",
                  border: (hasSpun || spinLocked) ? "1px solid rgba(255,255,255,0.1)" : "none",
                  borderRadius: 10,
                  color: (hasSpun || spinLocked) ? "rgba(255,255,255,0.25)" : "#fff",
                  fontSize: 14, fontWeight: 700,
                  cursor: (hasSpun || spinLocked) ? "not-allowed" : spinning ? "wait" : "pointer",
                  letterSpacing: "0.03em",
                  transition: "opacity 0.2s, transform 0.15s",
                  transform: spinning ? "scale(0.97)" : "scale(1)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {(hasSpun || spinLocked) && <FaLock size={12} />}
                {spinning ? "Spinning…" : (hasSpun || spinLocked) ? "Spun this week" : "Spin the Wheel"}
              </button>
            </div>

            {/* Right panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Result card (shows after spin) */}
              {showResult && result ? (
                <div style={{
                  background: isWin
                    ? "linear-gradient(135deg,rgba(16,185,129,0.12) 0%,rgba(139,92,246,0.12) 100%)"
                    : "rgba(255,255,255,0.04)",
                  border: isWin ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14, padding: "1.1rem 1.25rem",
                  animation: "fadeUp 0.4s ease-out",
                }}>
                  {isWin ? (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
                      <p style={{ color: "#10b981", fontWeight: 700, fontSize: 13, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Congratulations!
                      </p>
                      <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, margin: "0 0 10px" }}>
                        {result.label}
                      </h3>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, margin: "0 0 10px" }}>
                        Voucher saved to your profile
                      </p>
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        background: "rgba(0,0,0,0.35)", borderRadius: 8, padding: "8px 14px",
                        border: "1px dashed rgba(255,215,0,0.35)",
                      }}>
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Voucher code</span>
                        {saveStatus === "saving" ? (
                          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Saving…</span>
                        ) : saveStatus === "error" ? (
                          <span style={{ color: "#f87171", fontSize: 12 }}>Save failed</span>
                        ) : (
                          <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: 13, letterSpacing: "0.1em", fontFamily: "monospace" }}>
                            {displayCode}
                          </span>
                        )}
                      </div>
                      {saveStatus === "saved" && discountId && (
                        <button
                          onClick={() => handleCopy(discountId)}
                          style={{
                            marginTop: 8, width: "100%", padding: "7px 0",
                            background: copied ? "rgba(16,185,129,0.15)" : "rgba(251,191,36,0.12)",
                            border: copied ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(251,191,36,0.3)",
                            borderRadius: 7, color: copied ? "#10b981" : "#fbbf24",
                            fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.05em",
                            transition: "all 0.2s",
                          }}
                        >
                          {copied ? "✓ Copied!" : "📋 Copy Code"}
                        </button>
                      )}
                      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, margin: "8px 0 0", textAlign: "right" }}>
                        Valid for 7 days · Use at checkout
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>😔</div>
                      <h3 style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px" }}>
                        No discount this time
                      </h3>
                      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                        Come back next week for another spin!
                      </p>
                    </>
                  )}
                </div>
              ) : (
                /* Prizes list (before spin) */
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, padding: "1rem 1.25rem",
                }}>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px", fontWeight: 600 }}>
                    Possible Prizes
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {PRIZES.map((p) => (
                      <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: p.color + "28", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                          {p.icon}
                        </div>
                        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600 }}>{p.label}</span>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* How it works */}
              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 14, padding: "1rem 1.25rem",
              }}>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 10px", fontWeight: 600 }}>
                  How it works
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { n: "1", text: "Hit Spin to rotate the wheel" },
                    { n: "2", text: "Win a discount voucher instantly" },
                    { n: "3", text: "Apply the code at checkout" },
                  ].map((step) => (
                    <div key={step.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: "rgba(244,63,94,0.2)", color: "#f472b6",
                        fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>{step.n}</div>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, lineHeight: 1.5, paddingTop: 1 }}>{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Past vouchers history ── */}
        {!voucherLoading && pastVouchers.length > 0 && (
          <div style={{ maxWidth: 540, margin: "2.5rem auto 0" }}>
            <p style={{
              color: "rgba(255,255,255,0.25)", fontSize: 11,
              textTransform: "uppercase", letterSpacing: "0.12em",
              fontWeight: 600, margin: "0 0 12px",
            }}>Past Vouchers</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {pastVouchers.map((v) => (
                <VoucherCard
                  key={v._id || v.discountId}
                  voucher={v}
                  onCopy={handleCopy}
                  copied={false}
                  timeLeftMs={0}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes miniWheelSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}