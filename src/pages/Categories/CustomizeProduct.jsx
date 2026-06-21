// CustomizeProduct.jsx
// Page: /customize-product
// Flow: Category -> SubCategory -> Color -> Size -> GSM -> Material -> Print Placement & Upload(s) -> Live Preview -> Price -> Voucher -> Place Order
// Theme matches ViewCheckout / ViewPayment (dark #0E1320, purple #a078ff accents, green price)

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import {
  FiCheck, FiX, FiTag, FiLoader, FiUpload, FiRotateCw,
  FiChevronDown, FiChevronUp, FiInfo, FiEye,
} from "react-icons/fi";
import { MdDiscount, MdDeliveryDining } from "react-icons/md";
import { IoIosFlash } from "react-icons/io";
import { BsShieldLockFill, BsArrowReturnLeft, BsPatchCheckFill } from "react-icons/bs";
import { API } from "../../api";

// ─── Constants ────────────────────────────────────────────────────────────────

const CUSTOMIZABLE_CATEGORIES = ["Men", "Women", "Kids", "Oversized", "Hoodies"];
// Earrings / Necklaces deliberately excluded — not customizable products.

const SUB_CATEGORIES = {
  Men:   ["T-Shirt", "Jeans"],
  Women: ["T-Shirt", "Top"],
  Kids:  ["T-Shirt", "Pant", "Shirt"],
};
const needsSubCat = (c) => ["Men", "Women", "Kids"].includes(c);

// Garments that are flat tee/top-shaped vs the hoodie silhouette, for preview purposes.
const isHoodieCategory = (c) => c === "Hoodies";

const SIZES = ["S", "M", "L", "XL", "XXL"];

// Size chart in cm — chest width (flat, pit to pit) / length, garment-style.
const SIZE_CM = {
  S:   { chest: 46, length: 66 },
  M:   { chest: 49, length: 69 },
  L:   { chest: 52, length: 72 },
  XL:  { chest: 55, length: 75 },
  XXL: { chest: 58, length: 78 },
};

const GSM_OPTIONS = [
  { value: 150, label: "150 GSM", sub: "Light & breathable" },
  { value: 180, label: "180 GSM", sub: "Standard everyday wear" },
  { value: 220, label: "220 GSM", sub: "Heavyweight, premium feel" },
  { value: 280, label: "280 GSM", sub: "Ultra-heavy, best for Hoodies" },
];

const MATERIAL_OPTIONS = [
  { value: "Cotton",        label: "100% Cotton",       sub: "Soft, breathable, classic" },
  { value: "Polyester",     label: "Polyester",          sub: "Durable, holds print sharper" },
  { value: "Cotton-Blend",  label: "Cotton-Poly Blend",  sub: "Balanced comfort & durability" },
  { value: "Fleece",        label: "Fleece",             sub: "Warm — recommended for Hoodies" },
];

const PRODUCT_COLORS = [
  { name: "Black",     hex: "#111111" }, { name: "White",     hex: "#f5f5f5" },
  { name: "Navy Blue", hex: "#1e3a5f" }, { name: "Royal Blue",hex: "#2563eb" },
  { name: "Sky Blue",  hex: "#38bdf8" }, { name: "Teal",      hex: "#0d9488" },
  { name: "Green",     hex: "#16a34a" }, { name: "Olive",     hex: "#65a30d" },
  { name: "Yellow",    hex: "#eab308" }, { name: "Orange",    hex: "#ea580c" },
  { name: "Red",       hex: "#dc2626" }, { name: "Maroon",    hex: "#7f1d1d" },
  { name: "Pink",      hex: "#ec4899" }, { name: "Purple",    hex: "#9333ea" },
  { name: "Lavender",  hex: "#c4b5fd" }, { name: "Brown",     hex: "#92400e" },
  { name: "Beige",     hex: "#d4b896" }, { name: "Grey",      hex: "#6b7280" },
  { name: "Charcoal",  hex: "#374151" }, { name: "Off White", hex: "#faf7f2" },
  { name: "Cream",     hex: "#fef3c7" }, { name: "Mint",      hex: "#6ee7b7" },
  { name: "Coral",     hex: "#fb7185" }, { name: "Mustard",   hex: "#ca8a04" },
];

// ── Placement zones ──────────────────────────────────────────────────────────
// This is the answer to "how do we know where the print goes": instead of a
// free-floating crop box, the user picks a NAMED zone first. Each zone has a
// fixed anchor position on the garment silhouette (in a 300x360 viewBox) and
// a fixed max print size in cm. The crop tool is then constrained inside that
// zone, and the live preview renders the cropped art clipped into that exact
// zone on the actual garment outline — so placement is structural, not a guess.
const FRONT_ZONES = [
  { id: "chest-logo",   label: "Chest Logo",    sub: "Small badge, upper-left chest", anchor: { x: 116, y: 88 },  maxCm: { w: 10, h: 10 } },
  { id: "center-print", label: "Center Print",  sub: "Medium print, mid-chest",       anchor: { x: 150, y: 150 }, maxCm: { w: 20, h: 24 } },
  { id: "full-front",   label: "Full Front",    sub: "Large print across the torso",  anchor: { x: 150, y: 195 }, maxCm: { w: 26, h: 32 } },
];
const BACK_ZONES = [
  { id: "center-back",  label: "Center Back",   sub: "Medium print, upper back",      anchor: { x: 150, y: 130 }, maxCm: { w: 22, h: 26 } },
  { id: "full-back",    label: "Full Back",     sub: "Large print across the back",   anchor: { x: 150, y: 190 }, maxCm: { w: 26, h: 32 } },
];

const ZONE_BY_ID = [...FRONT_ZONES, ...BACK_ZONES].reduce((acc, z) => ({ ...acc, [z.id]: z }), {});

// ── Pricing config — EDIT THESE NUMBERS to tune pricing. All in ₹. ───────────
const BASE_PRICE = { Men: 449, Women: 469, Kids: 399, Oversized: 549, Hoodies: 799 };
const SIZE_ADDON     = { S: 0, M: 0, L: 20, XL: 40, XXL: 60 };
const GSM_ADDON       = { 150: 0, 180: 40, 220: 90, 280: 150 };
const MATERIAL_ADDON  = { Cotton: 0, Polyester: 20, "Cotton-Blend": 35, Fleece: 120 };
const PRINT_BASE_FEE     = 80;
const PRINT_RATE_PER_CM2 = 1.6;
const BOTH_SIDE_DISCOUNT_PCT = 10;
// Zone fee multiplier — bigger named zones cost a little more even at the
// same cm² since they require more setup/registration on the print machine.
const ZONE_FEE_MULTIPLIER = {
  "chest-logo": 1,
  "center-print": 1.15,
  "full-front": 1.3,
  "center-back": 1.15,
  "full-back": 1.3,
};

const DELIVERY_DAYS = "5–8 Business Days";
const calcDelivery = (finalPrice) => (finalPrice >= 699 ? 0 : Math.round(finalPrice * 0.07));
const fmt = (n) => "₹" + Number(Math.round(n)).toLocaleString("en-IN");

const STEPS = [
  { key: "category", label: "Product" },
  { key: "design",   label: "Design"  },
  { key: "review",   label: "Review & Pay" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStoredEmail = () => {
  try { const s = localStorage.getItem("user"); if (s) { const p = JSON.parse(s); if (p?.email) return p.email; } } catch (_) {}
  try { const c = Cookies.get("user"); if (c) { const p = JSON.parse(c); if (p?.email) return p.email; } } catch (_) {}
  return null;
};

// ─── Shared primitives ────────────────────────────────────────────────────────

const Card = ({ children, style = {} }) => <div className="cust-card" style={style}>{children}</div>;

const SecLabel = ({ children, right }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 8, flexWrap: "wrap" }}>
    <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8880aa", fontWeight: 700 }}>{children}</div>
    {right}
  </div>
);

function Stepper({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2rem", userSelect: "none", flexWrap: "wrap", gap: 0 }}>
      {STEPS.map((s, i) => {
        const done = i < current, active = i === current;
        return (
          <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 12, border: "2px solid",
                borderColor: done || active ? "#a078ff" : "rgba(160,120,255,0.22)",
                background: done ? "#a078ff" : "transparent",
                color: done ? "#fff" : active ? "#a078ff" : "#8880aa",
                boxShadow: active ? "0 0 10px rgba(160,120,255,0.3)" : done ? "0 0 14px rgba(160,120,255,0.55)" : "none",
                transition: "all 0.3s",
              }}>
                {done ? <FiCheck size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 9.5, letterSpacing: "0.13em", textTransform: "uppercase", color: active ? "#a078ff" : done ? "rgba(160,120,255,0.7)" : "#8880aa" }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 56, height: 1, margin: "0 6px 16px", background: done ? "#a078ff" : "rgba(160,120,255,0.18)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 99999,
      display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.2rem", borderRadius: 12,
      fontSize: 13, fontWeight: 600, backdropFilter: "blur(16px)", maxWidth: "92vw", textAlign: "center",
      background: type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
      border: type === "success" ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(239,68,68,0.4)",
      color: type === "success" ? "#6ee7b7" : "#fca5a5",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
    }}>
      {type === "success" ? <FiCheck size={15} /> : <FiX size={15} />}
      {message}
    </div>
  );
}

function OptionCard({ selected, onClick, title, sub, swatch, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 14, textAlign: "left",
        background: selected ? "rgba(160,120,255,0.10)" : "rgba(255,255,255,0.025)",
        border: selected ? "1px solid #a078ff" : "1px solid rgba(160,120,255,0.16)",
        boxShadow: selected ? "0 0 14px rgba(160,120,255,0.18)" : "none",
        color: selected ? "#e8e0ff" : "#b8b0cc",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1,
        width: "100%", transition: "all 0.16s", minWidth: 0,
      }}>
      {swatch && <div style={{ width: 22, height: 22, borderRadius: "50%", background: swatch, border: "2px solid rgba(255,255,255,0.25)", flexShrink: 0 }} />}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {sub && <div style={{ fontSize: 10.5, color: "#8880aa", marginTop: 1 }}>{sub}</div>}
      </div>
      {selected && (
        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#a078ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FiCheck size={11} color="#fff" />
        </div>
      )}
    </button>
  );
}

function SizeChartInfo() {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setShow((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: "#a078ff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
        <FiInfo size={13} /> Size chart (cm)
      </button>
      {show && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 30, background: "#161325", border: "1px solid rgba(160,120,255,0.3)", borderRadius: 12, padding: "10px 14px", boxShadow: "0 12px 40px rgba(0,0,0,0.6)", minWidth: 220 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ color: "#a078ff" }}>
                <th style={{ textAlign: "left", padding: "2px 6px" }}>Size</th>
                <th style={{ textAlign: "right", padding: "2px 6px" }}>Chest</th>
                <th style={{ textAlign: "right", padding: "2px 6px" }}>Length</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s) => (
                <tr key={s} style={{ color: "#e8e0ff" }}>
                  <td style={{ padding: "2px 6px", fontWeight: 700 }}>{s}</td>
                  <td style={{ textAlign: "right", padding: "2px 6px" }}>{SIZE_CM[s].chest} cm</td>
                  <td style={{ textAlign: "right", padding: "2px 6px" }}>{SIZE_CM[s].length} cm</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 9.5, color: "#8880aa", marginTop: 6 }}>Measured flat, pit-to-pit / shoulder-to-hem.</p>
        </div>
      )}
    </div>
  );
}

// ─── Garment Preview — live SVG mockup ────────────────────────────────────────
// Renders the actual selected garment color as a flat-lay silhouette, with
// each uploaded print clipped into the exact placement zone it was assigned
// to. This is what answers "how will it actually look" — it's not a generic
// stock photo, it's built from the live category/color/zone/crop state.

function GarmentSilhouette({ color, hoodie, viewBack }) {
  // Subtle gradient so a flat hex doesn't look like a paint swatch.
  const id = useMemo(() => `garmentGrad-${Math.random().toString(36).slice(2, 8)}`, []);
  const base = color || "#374151";

  const bodyPath = hoodie
    // Hoodie silhouette: hood at top, kangaroo pocket band, drawstrings
    ? "M 110 30 Q 150 6 190 30 L 200 46 L 230 40 L 268 92 L 244 112 L 226 100 L 226 330 Q 226 344 212 344 L 88 344 Q 74 344 74 330 L 74 100 L 56 112 L 32 92 L 70 40 L 100 46 Z"
    // Tee/top silhouette: simple flat-lay crew neck
    : "M 118 26 Q 150 8 182 26 L 196 40 L 232 32 L 262 84 L 236 106 L 214 92 L 214 326 Q 214 338 202 338 L 98 338 Q 86 338 86 326 L 86 92 L 64 106 L 38 84 L 68 32 L 104 40 Z";

  return (
    <svg viewBox="0 0 300 360" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={base} stopOpacity="1" />
          <stop offset="55%" stopColor={base} stopOpacity="0.94" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      <path d={bodyPath} fill={`url(#${id})`} stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />

      {/* center fold line for fabric realism */}
      <line x1="150" y1="46" x2="150" y2="334" stroke="rgba(0,0,0,0.10)" strokeWidth="1" />

      {/* collar */}
      {!viewBack && (
        <ellipse cx="150" cy="32" rx="22" ry="10" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" />
      )}
      {viewBack && (
        <ellipse cx="150" cy="28" rx="20" ry="6" fill="rgba(0,0,0,0.12)" />
      )}

      {/* hoodie extras */}
      {hoodie && !viewBack && (
        <>
          {/* kangaroo pocket */}
          <path d="M 100 230 Q 150 218 200 230 L 196 268 Q 150 280 104 268 Z" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
          {/* drawstrings */}
          <line x1="138" y1="50" x2="132" y2="92" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
          <line x1="162" y1="50" x2="168" y2="92" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PrintOnGarment({ zone, print }) {
  if (!zone || !print) return null;
  const z = ZONE_BY_ID[zone];
  if (!z) return null;

  // Scale the rendered print box by how much of the zone's max cm area the
  // user actually used — a small crop inside a big zone shows small & centered,
  // not stretched to fill, matching exactly what production will receive.
  const wRatio = Math.min(1, (print.widthCm || z.maxCm.w) / z.maxCm.w);
  const hRatio = Math.min(1, (print.heightCm || z.maxCm.h) / z.maxCm.h);

  // Convert the zone's max cm box to a px box in the 300x360 viewBox — fixed
  // visual scale: 1cm ≈ 3.6px at chest-width reference, tuned so the largest
  // zone (full-front, 26x32cm) comfortably fits the torso area.
  const CM_TO_PX = 3.4;
  const boxW = z.maxCm.w * CM_TO_PX * wRatio;
  const boxH = z.maxCm.h * CM_TO_PX * hRatio;
  const x = z.anchor.x - boxW / 2;
  const y = z.anchor.y - boxH / 2;

  const clipId = `printClip-${zone}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <svg viewBox="0 0 300 360" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <defs>
        <clipPath id={clipId}>
          <rect x={x} y={y} width={boxW} height={boxH} rx="2" />
        </clipPath>
      </defs>
      <image
        href={print.dataUrl}
        x={x} y={y} width={boxW} height={boxH}
        preserveAspectRatio="xMidYMid meet"
        clipPath={`url(#${clipId})`}
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))" }}
      />
      {/* faint placement outline so it's clear this sits in a defined zone, not floating free */}
      <rect x={x} y={y} width={boxW} height={boxH} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.75" strokeDasharray="3 2" rx="2" />
    </svg>
  );
}

function GarmentPreview({ category, color, frontZone, frontPrint, backZone, backPrint, bothSides }) {
  const [view, setView] = useState("front");
  const hoodie = isHoodieCategory(category);
  const swatch = PRODUCT_COLORS.find((c) => c.name === color)?.hex;
  const showBackToggle = bothSides && backPrint;

  useEffect(() => { if (!showBackToggle) setView("front"); }, [showBackToggle]);

  return (
    <div>
      <div style={{ position: "relative", width: "100%", aspectRatio: "300/360", borderRadius: 16, background: "radial-gradient(circle at 50% 20%, rgba(160,120,255,0.10), transparent 60%), #0a0814", border: "1px solid rgba(160,120,255,0.18)", overflow: "hidden" }}>
        {!category ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, color: "#5a5478", fontSize: 12, textAlign: "center", padding: 20 }}>
            <FiEye size={26} />
            Pick a product &amp; color to see the live preview
          </div>
        ) : (
          <>
            <GarmentSilhouette color={swatch} hoodie={hoodie} viewBack={view === "back"} />
            {view === "front"
              ? <PrintOnGarment zone={frontZone} print={frontPrint} />
              : <PrintOnGarment zone={backZone} print={backPrint} />}
          </>
        )}
      </div>

      {showBackToggle && category && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
          {["front", "back"].map((v) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 16px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, textTransform: "capitalize",
              background: view === v ? "rgba(160,120,255,0.18)" : "rgba(255,255,255,0.04)",
              border: view === v ? "1px solid #a078ff" : "1px solid rgba(160,120,255,0.15)",
              color: view === v ? "#e8e0ff" : "#8880aa", cursor: "pointer",
            }}>{v}</button>
          ))}
        </div>
      )}
      <p style={{ fontSize: 10, color: "#6b6490", textAlign: "center", marginTop: 8 }}>
        Live preview — actual fabric drape and print finish may vary slightly from this mockup.
      </p>
    </div>
  );
}

// ─── Placement Zone Picker ─────────────────────────────────────────────────────

function ZonePicker({ zones, selected, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {zones.map((z) => (
        <OptionCard key={z.id} selected={selected === z.id} onClick={() => onSelect(z.id)} title={z.label} sub={`${z.sub} · max ${z.maxCm.w}×${z.maxCm.h} cm`} />
      ))}
    </div>
  );
}

// ─── Print Cropper — freeform drag-resize box, constrained to a named zone ──
// Same interaction model as the admin ImageCropper, but freeform (no locked
// ratio) and clamped to the chosen placement zone's max cm size, so the
// output can never exceed what that zone on the garment can actually hold.

function PrintCropper({ src, maxWCm, maxHCm, onDone, onCancel }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const dragging = useRef(false);
  const resizing = useRef(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 1, h: 1 });
  const [display, setDisplay] = useState({ w: 0, h: 0, offX: 0, offY: 0 });
  const [containerSize, setContainerSize] = useState({ w: 300, h: 280 });

  const pxPerCmX = display.w > 0 ? display.w / maxWCm : 1;
  const pxPerCmY = display.h > 0 ? display.h / maxHCm : 1;

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setContainerSize({ w: Math.floor(width), h: Math.floor(width * (maxHCm / maxWCm)) });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [maxWCm, maxHCm]);

  const handleImgLoad = useCallback((e) => {
    const img = e.target;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  useEffect(() => {
    if (natural.w === 1 && natural.h === 1) return;
    const maxW = containerSize.w, maxH = containerSize.h;
    let dispW = natural.w, dispH = natural.h;
    if (dispW > maxW) { dispH = dispH * (maxW / dispW); dispW = maxW; }
    if (dispH > maxH) { dispW = dispW * (maxH / dispH); dispH = maxH; }
    dispW = Math.round(dispW); dispH = Math.round(dispH);
    const offX = Math.round((maxW - dispW) / 2);
    const offY = Math.round((maxH - dispH) / 2);
    setDisplay({ w: dispW, h: dispH, offX, offY });
    const cw = Math.round(dispW * 0.6);
    const ch = Math.round(dispH * 0.6);
    setCrop({ x: offX + Math.round((dispW - cw) / 2), y: offY + Math.round((dispH - ch) / 2), w: cw, h: ch });
    setImgLoaded(true);
  }, [containerSize, natural]);

  const getHandle = useCallback((mx, my, c) => {
    const hs = 16;
    const handles = [
      { id: "tl", x: c.x, y: c.y }, { id: "tr", x: c.x + c.w, y: c.y },
      { id: "bl", x: c.x, y: c.y + c.h }, { id: "br", x: c.x + c.w, y: c.y + c.h },
    ];
    for (const h of handles) if (Math.abs(mx - h.x) < hs && Math.abs(my - h.y) < hs) return h.id;
    return null;
  }, []);

  const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
  const getEventPos = (e, rect) => {
    if (e.touches) { const t = e.touches[0]; return { x: t.clientX - rect.left, y: t.clientY - rect.top }; }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { x: mx, y: my } = getEventPos(e, rect);
    const h = getHandle(mx, my, crop);
    if (h) resizing.current = h;
    else if (mx >= crop.x && mx <= crop.x + crop.w && my >= crop.y && my <= crop.y + crop.h) dragging.current = true;
    lastPos.current = { x: mx, y: my };
    e.preventDefault();
  }, [crop, getHandle]);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current && !resizing.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const { x: mx, y: my } = getEventPos(e, rect);
    const dx = mx - lastPos.current.x, dy = my - lastPos.current.y;
    lastPos.current = { x: mx, y: my };
    const { offX, offY, w: dw, h: dh } = display;
    const minX = offX, maxX = offX + dw, minY = offY, maxY = offY + dh;
    setCrop((prev) => {
      let { x, y, w, h } = prev;
      if (dragging.current) {
        x = clamp(x + dx, minX, maxX - w);
        y = clamp(y + dy, minY, maxY - h);
      } else if (resizing.current) {
        const r = resizing.current;
        let nx = x, ny = y, nw = w, nh = h;
        const minSize = 24;
        if (r === "br") { nw = clamp(w + dx, minSize, maxX - x); nh = clamp(h + dy, minSize, maxY - y); }
        if (r === "tr") { nw = clamp(w + dx, minSize, maxX - x); nh = clamp(h - dy, minSize, y + h - minY); ny = y + h - nh; }
        if (r === "bl") { nw = clamp(w - dx, minSize, x + w - minX); nx = x + w - nw; nh = clamp(h + dy, minSize, maxY - y); }
        if (r === "tl") { nw = clamp(w - dx, minSize, x + w - minX); nx = x + w - nw; nh = clamp(h - dy, minSize, y + h - minY); ny = y + h - nh; }
        x = nx; y = ny; w = nw; h = nh;
      }
      return { x, y, w, h };
    });
    e.preventDefault();
  }, [display]);

  const onPointerUp = useCallback(() => { dragging.current = false; resizing.current = null; }, []);

  const cropWidthCm  = pxPerCmX > 0 ? (crop.w / pxPerCmX).toFixed(1) : "0";
  const cropHeightCm = pxPerCmY > 0 ? (crop.h / pxPerCmY).toFixed(1) : "0";

  const handleApply = () => {
    const img = imgRef.current;
    const { x, y, w, h } = crop;
    const { offX, offY, w: dw, h: dh } = display;
    const scaleX = natural.w / dw, scaleY = natural.h / dh;
    const canvas = document.createElement("canvas");
    canvas.width  = Math.max(1, Math.round(w * scaleX));
    canvas.height = Math.max(1, Math.round(h * scaleY));
    canvas.getContext("2d").drawImage(
      img,
      (x - offX) * scaleX, (y - offY) * scaleY, w * scaleX, h * scaleY,
      0, 0, canvas.width, canvas.height
    );
    onDone({
      dataUrl: canvas.toDataURL("image/png", 0.95),
      widthCm: Number(cropWidthCm),
      heightCm: Number(cropHeightCm),
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div ref={containerRef} style={{ position: "relative", width: "100%", height: containerSize.h, background: "#0a0814", borderRadius: 12, overflow: "hidden", touchAction: "none", userSelect: "none", border: "1px solid rgba(160,120,255,0.18)" }}>
        <img ref={imgRef} src={src} alt="print upload" onLoad={handleImgLoad}
          style={{ position: "absolute", left: display.offX, top: display.offY, width: display.w, height: display.h, display: "block", userSelect: "none", pointerEvents: "none" }} />
        {imgLoaded && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: "crosshair", touchAction: "none" }}
            onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp} onMouseLeave={onPointerUp}
            onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}>
            <defs>
              <mask id="printCropMask">
                <rect width="100%" height="100%" fill="white" />
                <rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="black" />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.62)" mask="url(#printCropMask)" />
            <rect x={crop.x} y={crop.y} width={crop.w} height={crop.h} fill="none" stroke="#a078ff" strokeWidth="1.5" strokeDasharray="6 3" />
            {[
              { id: "tl", cx: crop.x,         cy: crop.y },
              { id: "tr", cx: crop.x + crop.w, cy: crop.y },
              { id: "bl", cx: crop.x,         cy: crop.y + crop.h },
              { id: "br", cx: crop.x + crop.w, cy: crop.y + crop.h },
            ].map((h) => (
              <rect key={h.id} x={h.cx - 9} y={h.cy - 9} width={18} height={18} rx={4} fill="#a078ff" stroke="#fff" strokeWidth="1.5" style={{ cursor: "nwse-resize" }} />
            ))}
            <text x={crop.x + crop.w / 2} y={crop.y + crop.h / 2} fill="#e8e0ff" fontSize="11" fontWeight="700" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
              {cropWidthCm} × {cropHeightCm} cm
            </text>
          </svg>
        )}
      </div>
      <p style={{ textAlign: "center", fontSize: 10.5, color: "#8880aa", margin: 0 }}>
        Drag to move · Drag corners to resize · Max for this zone: {maxWCm} × {maxHCm} cm
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>← Back</button>
        <button onClick={handleApply} style={{ flex: 2, padding: "10px", borderRadius: 10, background: "linear-gradient(135deg,#a078ff,#7c3aed)", border: "none", color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}>✓ Use This Print Area</button>
      </div>
    </div>
  );
}

// ─── Print Side Block — zone picker + upload + crop for one side ─────────────

function PrintSideBlock({ label, side, zones, zone, setZone, print, setPrint, accent = "#a078ff" }) {
  const fileRef = useRef();
  const [rawSrc, setRawSrc] = useState(null);
  const [cropping, setCropping] = useState(false);
  const selectedZone = zone ? ZONE_BY_ID[zone] : null;

  const handleZoneSelect = (zid) => {
    setZone(side, zid);
    // changing zone invalidates any prior crop sizing for this side
    if (print) setPrint(side, null);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => { setRawSrc(ev.target.result); setCropping(true); };
    reader.readAsDataURL(file);
  };

  const handleCropDone = (result) => {
    setPrint(side, result);
    setCropping(false);
    setRawSrc(null);
  };

  const handleClear = () => setPrint(side, null);

  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#e8e0ff", marginBottom: 8 }}>{label}</div>

      {/* Step A: choose placement zone */}
      <div style={{ marginBottom: selectedZone ? 12 : 0 }}>
        <div style={{ fontSize: 10, color: "#8880aa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>1. Choose placement</div>
        <ZonePicker zones={zones} selected={zone} onSelect={handleZoneSelect} />
      </div>

      {/* Step B: upload + crop, only once a zone is chosen */}
      {selectedZone && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 10, color: "#8880aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>2. Upload artwork</div>
            {print && <button onClick={handleClear} style={{ fontSize: 10.5, color: "#f87171", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><FiX size={11} /> Remove</button>}
          </div>

          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

          {cropping && rawSrc && (
            <PrintCropper src={rawSrc} maxWCm={selectedZone.maxCm.w} maxHCm={selectedZone.maxCm.h} onDone={handleCropDone} onCancel={() => { setCropping(false); setRawSrc(null); }} />
          )}

          {!cropping && print && (
            <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(160,120,255,0.06)", border: "1px solid rgba(160,120,255,0.2)", borderRadius: 12, padding: 10 }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", background: "#0a0814", border: "1px solid rgba(160,120,255,0.25)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img src={print.dataUrl} alt={label} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>{print.widthCm} × {print.heightCm} cm</div>
                <div style={{ fontSize: 10.5, color: "#8880aa" }}>{selectedZone.label} · {(print.widthCm * print.heightCm).toFixed(0)} cm²</div>
              </div>
              <button onClick={() => fileRef.current.click()} title="Re-upload" style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(160,120,255,0.12)", border: "1px solid rgba(160,120,255,0.25)", color: accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FiRotateCw size={13} />
              </button>
            </div>
          )}

          {!cropping && !print && (
            <button onClick={() => fileRef.current.click()} style={{
              width: "100%", padding: "18px 10px", borderRadius: 12, background: "rgba(160,120,255,0.05)",
              border: "1.5px dashed rgba(160,120,255,0.3)", color: "#a078ff", fontSize: 12, fontWeight: 600,
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            }}>
              <FiUpload size={20} />
              Upload artwork for {selectedZone.label}
              <span style={{ fontSize: 10, color: "#8880aa", fontWeight: 400 }}>PNG / JPG · transparent background recommended</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Voucher Box ───────────────────────────────────────────────────────────────

function VoucherBox({ appliedVoucher, onApply, onRemove, applying, error }) {
  const [code, setCode] = useState("");
  const handleApply = () => { const t = code.trim(); if (t) onApply(t); };

  if (appliedVoucher) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: "0.65rem 0.9rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(74,222,128,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiTag size={13} color="#4ade80" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#4ade80", fontFamily: "monospace", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{appliedVoucher.discountId}</div>
            <div style={{ fontSize: 10.5, color: "#8880aa" }}>{appliedVoucher.discountLabel} applied</div>
          </div>
        </div>
        <button onClick={onRemove} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171", fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 8, cursor: "pointer" }}>
          <FiX size={11} /> Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="voucher-row">
        <div className="voucher-input-wrap">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Have a voucher code? Enter it here"
            className="cust-text-input"
            style={{ width: "100%", boxSizing: "border-box", background: "#0E1320", border: `1px solid ${error ? "rgba(239,68,68,0.6)" : "rgba(160,120,255,0.25)"}`, borderRadius: 12, padding: "0.6rem 1rem", color: "#e8e0ff", outline: "none" }}
          />
        </div>
        <button onClick={handleApply} disabled={applying || !code.trim()} className="voucher-apply-btn"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12,
            background: applying || !code.trim() ? "rgba(160,120,255,0.15)" : "linear-gradient(135deg,#a078ff,#7c3aed)",
            border: "1px solid rgba(139,92,246,0.4)", color: applying || !code.trim() ? "#6b6490" : "#fff",
            fontWeight: 700, cursor: applying || !code.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
          {applying ? <FiLoader size={13} style={{ animation: "spin 0.75s linear infinite" }} /> : null}
          {applying ? "Checking…" : "Apply"}
        </button>
      </div>
      {error && <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#f87171" }}><FiX size={12} /> {error}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function CustomizeProduct() {
  const navigate = useNavigate();
  const email = getStoredEmail();

  const [step, setStep] = useState(0);
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  const [customerId, setCustomerId] = useState(null);
  useEffect(() => {
    const run = async () => {
      try {
        if (!email) return;
        const res = await API.post("/user/getProfile", { email });
        if (res.data.success) setCustomerId(res.data.user?.customerId || null);
      } catch (err) { console.error("fetchUser error", err); }
    };
    run();
  }, [email]);

  // ── Step 0: product ──
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [color, setColor] = useState("");

  const handleCategoryPick = (c) => {
    setCategory(c);
    setSubCategory(needsSubCat(c) ? SUB_CATEGORIES[c][0] : "");
  };

  // ── Step 1: design ──
  const [size, setSize] = useState("M");
  const [gsm, setGsm] = useState(180);
  const [material, setMaterial] = useState("Cotton");
  const [bothSides, setBothSides] = useState(false);
  const [qty, setQty] = useState(1);

  // placement zone + print, per side
  const [frontZone, setFrontZoneRaw] = useState(null);
  const [backZone, setBackZoneRaw]   = useState(null);
  const [prints, setPrints] = useState({ front: null, back: null });

  const setZone = (side, zid) => {
    if (side === "front") setFrontZoneRaw(zid);
    else setBackZoneRaw(zid);
  };
  const setPrint = (side, val) => setPrints((p) => ({ ...p, [side]: val }));

  useEffect(() => {
    if (category === "Hoodies") setMaterial("Fleece");
  }, [category]);

  const sizeInfo = SIZE_CM[size];

  // ── Voucher ──
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherApplying, setVoucherApplying] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  const handleApplyVoucher = async (code) => {
    if (!email) { setVoucherError("Please log in to use a voucher."); return; }
    setVoucherApplying(true); setVoucherError("");
    try {
      const res = await API.post("/discount/validateDiscount", { discountId: code, userEmail: email });
      if (res.data.success) { setAppliedVoucher(res.data.voucher); showToast(`Voucher ${code} applied 🎉`); }
      else setVoucherError(res.data.message || "Could not apply this voucher.");
    } catch (err) {
      setVoucherError(err.response?.data?.message || "Invalid or expired voucher code.");
    } finally { setVoucherApplying(false); }
  };
  const handleRemoveVoucher = () => { setAppliedVoucher(null); setVoucherError(""); };

  // ── Price calc ──
  const pricing = useMemo(() => {
    const base = BASE_PRICE[category] || 0;
    const sizeAdd = SIZE_ADDON[size] || 0;
    const gsmAdd  = GSM_ADDON[gsm]   || 0;
    const matAdd  = MATERIAL_ADDON[material] || 0;

    const sideEntries = [];
    if (prints.front && frontZone) sideEntries.push({ zone: frontZone, print: prints.front });
    if (bothSides && prints.back && backZone) sideEntries.push({ zone: backZone, print: prints.back });

    let printFee = 0;
    sideEntries.forEach(({ zone, print }) => {
      const area = (print.widthCm || 0) * (print.heightCm || 0);
      const mult = ZONE_FEE_MULTIPLIER[zone] || 1;
      printFee += (PRINT_BASE_FEE + area * PRINT_RATE_PER_CM2) * mult;
    });
    let printDiscount = 0;
    if (sideEntries.length === 2) {
      printDiscount = printFee * (BOTH_SIDE_DISCOUNT_PCT / 100);
      printFee -= printDiscount;
    }

    const unitPrice = base + sizeAdd + gsmAdd + matAdd + printFee;
    const subtotal  = unitPrice * qty;

    const voucherPct = appliedVoucher?.discountValue || 0;
    const voucherDiscountAmt = voucherPct > 0 ? Math.round(subtotal * (voucherPct / 100)) : 0;
    const afterVoucher = subtotal - voucherDiscountAmt;
    const delivery = calcDelivery(qty > 0 ? afterVoucher / qty : unitPrice);
    const total = afterVoucher + delivery;

    return {
      base, sizeAdd, gsmAdd, matAdd, printFee, printDiscount, sideEntries,
      unitPrice, subtotal, voucherDiscountAmt, delivery, total,
    };
  }, [category, size, gsm, material, prints, frontZone, backZone, bothSides, qty, appliedVoucher]);

  // ── Validation ──
  const canGoDesign = !!category && (!needsSubCat(category) || !!subCategory) && !!color;
  const canGoReview = canGoDesign && !!frontZone && !!prints.front && (!bothSides || (!!backZone && !!prints.back));

  // ── Place order ──
  const [placing, setPlacing] = useState(false);
  const [orderErr, setOrderErr] = useState("");

  const handlePlaceOrder = async () => {
    if (!customerId) { setOrderErr("Please log in to place an order."); return; }
    if (!canGoReview) { setOrderErr("Please complete all design steps first."); return; }
    setOrderErr(""); setPlacing(true);
    try {
      const selectedColor = PRODUCT_COLORS.find((c) => c.name === color);
      const printsPayload = [];
      if (prints.front && frontZone) {
        printsPayload.push({ side: "front", placement: frontZone, image: prints.front.dataUrl, widthCm: prints.front.widthCm, heightCm: prints.front.heightCm });
      }
      if (bothSides && prints.back && backZone) {
        printsPayload.push({ side: "back", placement: backZone, image: prints.back.dataUrl, widthCm: prints.back.widthCm, heightCm: prints.back.heightCm });
      }

      const payload = {
        customerId,
        category, subCategory: subCategory || null,
        color: selectedColor || null,
        size, sizeCm: { chest: sizeInfo.chest, length: sizeInfo.length },
        gsm, material,
        prints: printsPayload,
        quantity: qty,
        unitPrice: Math.round(pricing.unitPrice),
        subtotal: Math.round(pricing.subtotal),
        deliveryCharge: pricing.delivery,
        voucherId: appliedVoucher ? appliedVoucher.discountId : null,
        voucherDiscount: appliedVoucher ? pricing.voucherDiscountAmt : 0,
        totalPrice: Math.round(pricing.total),
        payMethod: "COD",
      };

      const res = await API.post("/customizeOrder/createCustomOrder", payload);
      if (res.data.success) {
        if (appliedVoucher && email) {
          try {
            await API.post("/discount/consumeDiscount", { discountId: appliedVoucher.discountId, userEmail: email, orderId: res.data.data?._id });
          } catch (e) { console.error("Voucher consume failed after custom order placed:", e); }
        }
        showToast("Custom order placed successfully 🎉");
        navigate("/order-success");
      } else {
        setOrderErr(res.data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      setOrderErr(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const stepTitles = ["Choose Your Product", "Design Your Print", "Review & Place Order"];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box} body{margin:0} input{outline:none}
        html, body { overflow-x: hidden; }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(160,120,255,0.25);border-radius:4px}
        .cinzel{font-family:'Cinzel',serif}
        .cust-page-inner { max-width: 1100px; margin: 0 auto; padding: 1.5rem 1rem 0; }
        .cust-card { background:#12121a; border:1px solid rgba(160,120,255,0.13); border-radius:18px; padding: 1.1rem 1.3rem; min-width:0; }
        .cust-text-input { font-size: 0.95rem; }
        .voucher-row { display: flex; flex-direction: column; gap: 8px; }
        .voucher-input-wrap { flex: 1; min-width: 0; }
        .voucher-apply-btn { width: 100%; padding: 0.65rem 0; font-size: 13px; }
        .opt-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .opt-grid-color { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px,1fr)); gap: 8px; max-height: 260px; overflow-y: auto; padding-right: 2px; }
        @media (min-width: 380px) {
          .voucher-row { flex-direction: row; gap: 8px; }
          .voucher-apply-btn { width: auto; padding: 0 1.1rem; flex-shrink: 0; }
        }
        @media (min-width: 720px) {
          .cust-grid { grid-template-columns: 1fr 360px !important; }
        }
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#0E1320", color: "#e8e0ff", paddingBottom: 60, fontFamily: "'Raleway', sans-serif" }}>
        <div className="cust-page-inner">
          <Stepper current={step} />

          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <h1 className="cinzel" style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#e8e0ff" }}>
              Customize Your {category || "Product"}
            </h1>
            <p style={{ fontSize: 13, color: "#8880aa", marginTop: 4 }}>{stepTitles[step]}</p>
          </div>

          {/* ════════ STEP 0 — PRODUCT ════════ */}
          {step === 0 && (
            <div className="cust-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.1rem", animation: "fadeSlideIn 0.25s ease" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <Card>
                  <SecLabel>Category</SecLabel>
                  <div className="opt-grid-2">
                    {CUSTOMIZABLE_CATEGORIES.map((c) => (
                      <OptionCard key={c} selected={category === c} onClick={() => handleCategoryPick(c)} title={c}
                        sub={c === "Hoodies" ? "Heavyweight fleece" : c === "Oversized" ? "Streetwear fit" : "Standard fit"} />
                    ))}
                  </div>
                  <p style={{ fontSize: 10.5, color: "#8880aa", marginTop: 10 }}>
                    Earrings &amp; Necklaces aren't customizable — only apparel can be printed on.
                  </p>
                </Card>

                {needsSubCat(category) && (
                  <Card>
                    <SecLabel>Sub-Category</SecLabel>
                    <div className="opt-grid-2">
                      {SUB_CATEGORIES[category].map((s) => (
                        <OptionCard key={s} selected={subCategory === s} onClick={() => setSubCategory(s)} title={s} />
                      ))}
                    </div>
                  </Card>
                )}

                {category && (
                  <Card>
                    <SecLabel>Garment Color</SecLabel>
                    <div className="opt-grid-color">
                      {PRODUCT_COLORS.map((c) => (
                        <OptionCard key={c.name} selected={color === c.name} onClick={() => setColor(c.name)} title={c.name} swatch={c.hex} />
                      ))}
                    </div>
                  </Card>
                )}

                <button
                  onClick={() => canGoDesign && setStep(1)}
                  disabled={!canGoDesign}
                  style={{
                    width: "100%", padding: "0.9rem", borderRadius: 16, border: "none",
                    background: canGoDesign ? "linear-gradient(135deg,#a078ff,#7c3aed)" : "rgba(160,120,255,0.15)",
                    color: canGoDesign ? "#fff" : "#6b6490", fontWeight: 700, fontSize: 14,
                    cursor: canGoDesign ? "pointer" : "not-allowed", boxShadow: canGoDesign ? "0 4px 20px rgba(124,58,237,0.4)" : "none",
                  }}>
                  Continue to Design →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Card>
                  <SecLabel>Live Preview</SecLabel>
                  <GarmentPreview category={category} color={color} frontZone={null} frontPrint={null} backZone={null} backPrint={null} bothSides={false} />
                </Card>
              </div>
            </div>
          )}

          {/* ════════ STEP 1 — DESIGN ════════ */}
          {step === 1 && (
            <div className="cust-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>

                <Card>
                  <SecLabel right={<SizeChartInfo />}>Size</SecLabel>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {SIZES.map((s) => (
                      <button key={s} onClick={() => setSize(s)} style={{
                        flex: "1 1 56px", padding: "10px 0", borderRadius: 12, textAlign: "center",
                        background: size === s ? "rgba(160,120,255,0.12)" : "rgba(255,255,255,0.025)",
                        border: size === s ? "1px solid #a078ff" : "1px solid rgba(160,120,255,0.16)",
                        color: size === s ? "#e8e0ff" : "#b8b0cc", fontWeight: 700, fontSize: 13, cursor: "pointer",
                      }}>{s}</button>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "#8880aa", marginTop: 10 }}>
                    {size}: Chest {sizeInfo.chest} cm · Length {sizeInfo.length} cm
                  </p>
                </Card>

                <Card>
                  <SecLabel>Fabric GSM</SecLabel>
                  <div className="opt-grid-2">
                    {GSM_OPTIONS.map((g) => (
                      <OptionCard key={g.value} selected={gsm === g.value} onClick={() => setGsm(g.value)} title={g.label} sub={g.sub} />
                    ))}
                  </div>
                </Card>

                <Card>
                  <SecLabel>Material</SecLabel>
                  <div className="opt-grid-2">
                    {MATERIAL_OPTIONS.map((m) => (
                      <OptionCard key={m.value} selected={material === m.value} onClick={() => setMaterial(m.value)} title={m.label} sub={m.sub} />
                    ))}
                  </div>
                </Card>

                <Card>
                  <SecLabel right={
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#8880aa", cursor: "pointer" }}>
                      <input type="checkbox" checked={bothSides} onChange={(e) => setBothSides(e.target.checked)} style={{ accentColor: "#a078ff" }} />
                      Print on both sides
                    </label>
                  }>
                    Print Placement &amp; Artwork
                  </SecLabel>
                  <p style={{ fontSize: 10.5, color: "#8880aa", marginTop: -6, marginBottom: 14 }}>
                    Pick exactly where the print goes on the garment first — the upload &amp; crop tool is then locked to that area, so what you see in the preview is what gets produced.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <PrintSideBlock label="Front Print" side="front" zones={FRONT_ZONES} zone={frontZone} setZone={setZone} print={prints.front} setPrint={setPrint} />
                    {bothSides && (
                      <PrintSideBlock label="Back Print" side="back" zones={BACK_ZONES} zone={backZone} setZone={setZone} print={prints.back} setPrint={setPrint} accent="#4ade80" />
                    )}
                  </div>
                </Card>

                <Card>
                  <SecLabel>Quantity</SecLabel>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(160,120,255,0.25)", borderRadius: 12, overflow: "hidden" }}>
                      <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 36, height: 36, color: qty <= 1 ? "#3a3456" : "#a078ff", background: "transparent", border: "none", cursor: qty <= 1 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700 }}>−</button>
                      <span style={{ padding: "0 14px", fontSize: 14, fontWeight: 600 }}>{qty}</span>
                      <button onClick={() => setQty((q) => Math.min(10, q + 1))} style={{ width: 36, height: 36, color: qty >= 10 ? "#3a3456" : "#a078ff", background: "transparent", border: "none", cursor: qty >= 10 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700 }}>+</button>
                    </div>
                    {qty >= 10 && <span style={{ fontSize: 10, color: "#f87171" }}>Max 10 per custom order</span>}
                  </div>
                </Card>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(0)} style={{ flex: 1, padding: "0.85rem", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#b8b0cc", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>← Back</button>
                  <button onClick={() => canGoReview && setStep(2)} disabled={!canGoReview} style={{
                    flex: 2, padding: "0.85rem", borderRadius: 16, border: "none",
                    background: canGoReview ? "linear-gradient(135deg,#a078ff,#7c3aed)" : "rgba(160,120,255,0.15)",
                    color: canGoReview ? "#fff" : "#6b6490", fontWeight: 700, fontSize: 14,
                    cursor: canGoReview ? "pointer" : "not-allowed", boxShadow: canGoReview ? "0 4px 20px rgba(124,58,237,0.4)" : "none",
                  }}>
                    Review Order →
                  </button>
                </div>
                {!canGoReview && (
                  <p style={{ fontSize: 11, color: "#f87171", textAlign: "center", marginTop: -4 }}>
                    Choose a placement &amp; upload {bothSides ? "both front & back prints" : "a front print"} to continue.
                  </p>
                )}
              </div>

              {/* live preview + price sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Card>
                  <SecLabel>Live Preview</SecLabel>
                  <GarmentPreview category={category} color={color} frontZone={frontZone} frontPrint={prints.front} backZone={backZone} backPrint={prints.back} bothSides={bothSides} />
                </Card>
                <Card>
                  <SecLabel>Live Price Estimate</SecLabel>
                  <PriceBreakdown pricing={pricing} qty={qty} category={category} />
                </Card>
              </div>
            </div>
          )}

          {/* ════════ STEP 2 — REVIEW & PAY ════════ */}
          {step === 2 && (
            <div className="cust-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.1rem", animation: "fadeSlideIn 0.25s ease" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                <Card>
                  <SecLabel right={<button onClick={() => setStep(0)} style={{ fontSize: 11, color: "#a078ff", background: "none", border: "none", cursor: "pointer" }}>Edit</button>}>
                    Product
                  </SecLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13 }}>
                    <ReviewField label="Category" value={subCategory ? `${subCategory} (${category})` : category} />
                    <ReviewField label="Color" value={color} swatch={PRODUCT_COLORS.find((c) => c.name === color)?.hex} />
                    <ReviewField label="Size" value={`${size} (${sizeInfo.chest}×${sizeInfo.length} cm)`} />
                  </div>
                </Card>

                <Card>
                  <SecLabel right={<button onClick={() => setStep(1)} style={{ fontSize: 11, color: "#a078ff", background: "none", border: "none", cursor: "pointer" }}>Edit</button>}>
                    Design
                  </SecLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 13, marginBottom: 14 }}>
                    <ReviewField label="GSM" value={`${gsm} GSM`} />
                    <ReviewField label="Material" value={material} />
                    <ReviewField label="Quantity" value={qty} />
                  </div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {prints.front && frontZone && (
                      <div style={{ width: 100 }}>
                        <div style={{ width: 100, height: 100, borderRadius: 12, overflow: "hidden", background: "#0a0814", border: "1px solid rgba(160,120,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={prints.front.dataUrl} alt="front print" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </div>
                        <p style={{ fontSize: 10, textAlign: "center", color: "#8880aa", marginTop: 4 }}>{ZONE_BY_ID[frontZone]?.label}<br />{prints.front.widthCm}×{prints.front.heightCm}cm</p>
                      </div>
                    )}
                    {bothSides && prints.back && backZone && (
                      <div style={{ width: 100 }}>
                        <div style={{ width: 100, height: 100, borderRadius: 12, overflow: "hidden", background: "#0a0814", border: "1px solid rgba(160,120,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <img src={prints.back.dataUrl} alt="back print" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </div>
                        <p style={{ fontSize: 10, textAlign: "center", color: "#8880aa", marginTop: 4 }}>{ZONE_BY_ID[backZone]?.label}<br />{prints.back.widthCm}×{prints.back.heightCm}cm</p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <SecLabel>Live Preview</SecLabel>
                  <GarmentPreview category={category} color={color} frontZone={frontZone} frontPrint={prints.front} backZone={backZone} backPrint={prints.back} bothSides={bothSides} />
                </Card>

                <Card>
                  <SecLabel>Apply Voucher</SecLabel>
                  <VoucherBox appliedVoucher={appliedVoucher} onApply={handleApplyVoucher} onRemove={handleRemoveVoucher} applying={voucherApplying} error={voucherError} />
                </Card>

                <Card>
                  <SecLabel>Payment Method</SecLabel>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(160,120,255,0.08)", border: "1px solid rgba(160,120,255,0.25)" }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Cash on Delivery</span>
                    <span style={{ fontSize: 10.5, color: "#8880aa" }}>— Pay when your custom order arrives</span>
                  </div>
                  <p style={{ fontSize: 10.5, color: "#8880aa", marginTop: 8 }}>
                    Need to change an uploaded print or its placement? Go back to the Design step — your size, GSM and material selections are kept.
                  </p>
                </Card>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Card>
                  <SecLabel>Price Summary</SecLabel>
                  <PriceBreakdown pricing={pricing} qty={qty} category={category} detailed />
                </Card>

                {orderErr && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "10px 14px", color: "#fca5a5", fontSize: 12 }}>
                    <FiX size={14} /> {orderErr}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: "0.9rem", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#b8b0cc", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>← Back</button>
                  <button onClick={handlePlaceOrder} disabled={placing} style={{
                    flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "0.9rem", borderRadius: 16, border: "none",
                    background: placing ? "rgba(255,214,0,0.5)" : "linear-gradient(135deg,#FFE51F,#FFD600)",
                    color: "#111827", fontWeight: 700, fontSize: 14, cursor: placing ? "not-allowed" : "pointer",
                    boxShadow: "0 0 24px rgba(255,229,31,0.35)",
                  }}>
                    {placing
                      ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.75s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Placing…</>
                      : <><IoIosFlash size={20} /> Place Custom Order · {fmt(pricing.total)}</>
                    }
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, textAlign: "center" }}>
                  {[
                    { icon: <BsShieldLockFill size={16} color="#a078ff" />, label: "Secure Order" },
                    { icon: <BsArrowReturnLeft size={16} color="#a078ff" />, label: "Quality Checked" },
                    { icon: <BsPatchCheckFill size={16} color="#a078ff" />, label: "Made to Order" },
                  ].map((b, i) => (
                    <div key={i} style={{ background: "#12121a", border: "1px solid rgba(160,120,255,0.1)", borderRadius: 12, padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      {b.icon}
                      <span style={{ fontSize: 9, color: "#8880aa" }}>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

// ─── Small review field ────────────────────────────────────────────────────────
function ReviewField({ label, value, swatch }) {
  return (
    <div>
      <div style={{ fontSize: 9.5, color: "#8880aa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#e8e0ff" }}>
        {swatch && <div style={{ width: 14, height: 14, borderRadius: "50%", background: swatch, border: "1.5px solid rgba(255,255,255,0.25)" }} />}
        {value}
      </div>
    </div>
  );
}

// ─── Reusable price breakdown block ───────────────────────────────────────────
function PriceBreakdown({ pricing, qty, category, detailed }) {
  const [feesOpen, setFeesOpen] = useState(false);
  if (!category) {
    return <p style={{ fontSize: 12, color: "#8880aa" }}>Select a product to see pricing.</p>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", fontSize: 13.5 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#8880aa" }}>Base price ({category})</span>
        <span style={{ color: "#e8e0ff", fontWeight: 500 }}>{fmt(pricing.base)}</span>
      </div>
      {pricing.sizeAdd > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#8880aa" }}>Size add-on</span>
          <span style={{ color: "#e8e0ff", fontWeight: 500 }}>+ {fmt(pricing.sizeAdd)}</span>
        </div>
      )}
      {pricing.gsmAdd > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#8880aa" }}>GSM upgrade</span>
          <span style={{ color: "#e8e0ff", fontWeight: 500 }}>+ {fmt(pricing.gsmAdd)}</span>
        </div>
      )}
      {pricing.matAdd > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#8880aa" }}>Material upgrade</span>
          <span style={{ color: "#e8e0ff", fontWeight: 500 }}>+ {fmt(pricing.matAdd)}</span>
        </div>
      )}
      {pricing.sideEntries.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#8880aa" }}>
            Print fee ({pricing.sideEntries.map((s) => ZONE_BY_ID[s.zone]?.label).join(" + ")})
          </span>
          <span style={{ color: "#e8e0ff", fontWeight: 500 }}>+ {fmt(pricing.printFee)}</span>
        </div>
      )}
      {pricing.printDiscount > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#8880aa", display: "flex", alignItems: "center", gap: 4 }}><MdDiscount size={12} color="#4ade80" /> Both-sides discount</span>
          <span style={{ color: "#4ade80", fontWeight: 600 }}>− {fmt(pricing.printDiscount)}</span>
        </div>
      )}

      <div style={{ height: 1, background: "rgba(160,120,255,0.1)", margin: "2px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: "#8880aa" }}>Unit price{qty > 1 ? ` × ${qty}` : ""}</span>
        <span style={{ color: "#e8e0ff", fontWeight: 600 }}>{fmt(pricing.subtotal)}</span>
      </div>

      {pricing.voucherDiscountAmt > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#8880aa", display: "flex", alignItems: "center", gap: 4 }}><FiTag size={12} color="#4ade80" /> Voucher discount</span>
          <span style={{ color: "#4ade80", fontWeight: 600 }}>− {fmt(pricing.voucherDiscountAmt)}</span>
        </div>
      )}

      <div>
        <button onClick={() => setFeesOpen((p) => !p)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "transparent", border: "none", color: "#8880aa", cursor: "pointer", fontSize: 13.5 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MdDeliveryDining size={14} /> Delivery {feesOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
          </span>
          <span style={{ color: pricing.delivery === 0 ? "#4ade80" : "#e8e0ff", fontWeight: 600 }}>
            {pricing.delivery === 0 ? "FREE" : fmt(pricing.delivery)}
          </span>
        </button>
        {feesOpen && detailed && (
          <div style={{ marginTop: 6, fontSize: 11, color: "#8880aa", background: "#0E1320", border: "1px solid rgba(160,120,255,0.13)", borderRadius: 10, padding: "8px 12px" }}>
            Estimated delivery: {DELIVERY_DAYS}. Custom orders are made after the order is placed, so production + shipping takes a little longer than ready-made items.
          </div>
        )}
      </div>

      <div style={{ height: 1, background: "rgba(160,120,255,0.1)", margin: "2px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#e8e0ff", fontWeight: 700, fontSize: 14 }}>Total</span>
        <span className="cinzel" style={{ fontSize: 20, fontWeight: 700, color: "#17ec03" }}>{fmt(pricing.total)}</span>
      </div>
    </div>
  );
}