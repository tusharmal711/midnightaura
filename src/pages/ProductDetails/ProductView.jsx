import { useState, useEffect, useRef, useCallback } from "react";
import { IoIosFlash } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";
import { HiHomeModern } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { PiTShirtFill } from "react-icons/pi";
import { API } from "../../api";
import CryptoJS from "crypto-js";
import { FaCartShopping } from "react-icons/fa6";
import ProductCard from "../../components/ProductCard";
import { FaCamera } from "react-icons/fa";

const SECRET_KEY = "midnightaura_secret_key";
const BASE_URL   = "http://localhost:8008";
const SIZES      = ["S", "M", "L", "XL", "XXL"];

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ n }) =>
  [1, 2, 3, 4, 5].map((s) => (
    <span key={s} style={{ color: s <= n ? "#facc15" : "#3a3456" }}>★</span>
  ));

const starString = (rating) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - (half ? 1 : 0));
};

const AVATAR_GRADS = [
  "linear-gradient(135deg,#a078ff,#ff6eb4)",
  "linear-gradient(135deg,#4ade80,#06b6d4)",
  "linear-gradient(135deg,#f0c060,#ff6eb4)",
  "linear-gradient(135deg,#60a5fa,#a78bfa)",
  "linear-gradient(135deg,#fb7185,#f472b6)",
  "linear-gradient(135deg,#34d399,#3b82f6)",
];
const avatarGrad = (id) => AVATAR_GRADS[(id?.charCodeAt(0) ?? 0) % AVATAR_GRADS.length];
const initial    = (id)  => (id?.[0] ?? "U").toUpperCase();
const fmtDate    = (d)   => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ProductViewSkeleton() {
  const shimmer = {
    background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
    backgroundSize: "600px 100%",
    animation: "sk-shimmer 1.4s infinite linear",
    borderRadius: 10,
  };
  return (
    <div style={{ maxWidth: 1152, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "2.5rem" }}>
        <div style={{ ...shimmer, aspectRatio: "4/5", width: "70%", margin: "0 auto", borderRadius: 16 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...shimmer, height: 28, width: "80%" }} />
          <div style={{ ...shimmer, height: 16, width: "50%" }} />
          <div style={{ ...shimmer, height: 36, width: "40%" }} />
          <div style={{ display: "flex", gap: 8 }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ ...shimmer, width: 40, height: 40, borderRadius: 10 }} />)}
          </div>
          <div style={{ ...shimmer, height: 100, borderRadius: 14 }} />
          <div style={{ ...shimmer, height: 52, borderRadius: 14 }} />
        </div>
      </div>
    </div>
  );
}

// ── Auth Toast ────────────────────────────────────────────────────────────────
const AuthToast = ({ visible, onLogin, onDismiss }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 60,
    display: "flex", alignItems: "flex-end", justifyContent: "center",
    paddingBottom: 40, paddingLeft: 16, paddingRight: 16,
    pointerEvents: "none", transition: "opacity 0.3s", opacity: visible ? 1 : 0,
  }}>
    <div style={{
      pointerEvents: "auto", width: "100%", maxWidth: 384,
      background: "#1a1730", border: "1px solid rgba(160,120,255,0.35)",
      borderRadius: 16, padding: "16px 20px", boxShadow: "0 0 40px rgba(160,120,255,0.25)",
      transform: visible ? "translateY(0)" : "translateY(32px)", transition: "transform 0.3s",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(160,120,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🔐</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e0ff", marginBottom: 2 }}>Login required</div>
          <div style={{ fontSize: 12, color: "#8880aa" }}>Please sign in to continue with your purchase.</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={onDismiss} style={{ flex: 1, padding: "8px 0", borderRadius: 12, border: "1px solid rgba(160,120,255,0.22)", background: "transparent", color: "#8880aa", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
        <button onClick={onLogin}   style={{ flex: 1, padding: "8px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Sign In →</button>
      </div>
    </div>
  </div>
);

// ── Size Toast ────────────────────────────────────────────────────────────────
const SizeToast = ({ visible, onDismiss }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 60,
    display: "flex", alignItems: "flex-end", justifyContent: "center",
    paddingBottom: 40, paddingLeft: 16, paddingRight: 16,
    pointerEvents: "none", opacity: visible ? 1 : 0, transition: "opacity 0.3s",
  }}>
    <div style={{
      pointerEvents: "auto", width: "100%", maxWidth: 384,
      background: "#1a1730", border: "1px solid rgba(255,120,80,0.45)",
      borderRadius: 16, padding: "16px 20px", boxShadow: "0 0 40px rgba(255,120,80,0.2)",
      transform: visible ? "translateY(0)" : "translateY(32px)", transition: "transform 0.3s",
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,120,80,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
          <PiTShirtFill style={{ color: "#fff" }} size={24} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#ffe0d8", marginBottom: 2 }}>Please select a size</div>
          <div style={{ fontSize: 12, color: "#aa8880" }}>Choose an available size before adding to cart or buying.</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={onDismiss} style={{ flex: 1, padding: "8px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#ea580c,#dc2626)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Got it</button>
      </div>
    </div>
  </div>
);

// ── CTA Buttons ───────────────────────────────────────────────────────────────
const CTAButtons = ({ compact = false, onCart, onBuy, sizeError }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
    {sizeError && (
      <div style={{
        fontSize: 12, color: "#fb923c",
        background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.25)",
        borderRadius: 12, padding: "8px 12px", textAlign: "center", fontWeight: 600,
        animation: "size-shake 0.35s ease",
      }}>
        Please select a size first
      </div>
    )}
    <div className="flex gap-3 w-full items-stretch">
      <button
        onClick={onCart}
        className={`flex-1 min-h-[56px] h-[56px] flex items-center justify-center gap-2 rounded-xl border border-[#8B5CF6] bg-[#111827]/95 backdrop-blur-md text-[#C4B5FD] font-semibold tracking-wide shadow-[0_0_18px_rgba(139,92,246,0.18)] hover:bg-[#1E1B4B] hover:shadow-[0_0_26px_rgba(139,92,246,0.35)] hover:border-[#A78BFA] transition-all duration-300 ${compact ? "text-sm" : "text-md"}`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <FaCartShopping size={20}/> Add to Cart
      </button>
      <button
        onClick={onBuy}
        className={`flex-1 min-h-[56px] h-[56px] flex items-center justify-center gap-2 rounded-xl border-none bg-gradient-to-br from-[#FFE51F] to-[#FFD600] text-[#111827] font-bold shadow-[0_0_20px_rgba(255,229,31,0.35)] hover:shadow-[0_0_30px_rgba(255,229,31,0.55)] hover:-translate-y-[1px] transition-all duration-300 ${compact ? "text-sm" : "text-md"}`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <IoIosFlash size={20} />
        Buy Now
      </button>
    </div>
  </div>
);

// ── Customer Image Lightbox ───────────────────────────────────────────────────
const CustomerImageLightbox = ({ images, startIdx, onClose }) => {
  const [idx, setIdx]         = useState(startIdx);
  const [visible, setVisible] = useState(false);
  const [sliding, setSliding] = useState(false);
  const touchStartX           = useRef(0);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const goTo = useCallback((dir) => {
    if (sliding) return;
    setSliding(true);
    setTimeout(() => { setIdx(i => (i + dir + images.length) % images.length); setSliding(false); }, 220);
  }, [sliding, images.length]);

  const prev = useCallback(() => goTo(-1), [goTo]);
  const next = useCallback(() => goTo(+1), [goTo]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  const isMobile = window.innerWidth <= 768;
  const cur = images[idx];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.96)",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: visible ? 1 : 0, transition: "opacity 0.2s ease",
    }}>
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, zIndex: 20, width: 44, height: 44, borderRadius: "50%", background: "rgba(40,40,40,0.95)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

      {!isMobile && images.length > 1 && (
        <>
          <button onClick={prev} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", zIndex: 20, width: 48, height: 48, borderRadius: "50%", background: "rgba(40,40,40,0.9)", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <button onClick={next} style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 20, width: 48, height: 48, borderRadius: "50%", background: "rgba(40,40,40,0.9)", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </>
      )}

      <div
        onTouchStart={e => { touchStartX.current = e.changedTouches[0].screenX; }}
        onTouchEnd={e => {
          const diff = touchStartX.current - e.changedTouches[0].screenX;
          if (diff > 50) next();
          if (diff < -50) prev();
        }}
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        {cur?.imageFeedback?.imageData ? (
          <img src={cur.imageFeedback.imageData} alt={`Customer photo ${idx + 1}`} draggable={false}
            style={{ width: "100%", height: "100%", objectFit: isMobile ? "cover" : "contain", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1a1730,#0e1320)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", gap: 12 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span style={{ fontSize: 13 }}>Customer Photo</span>
          </div>
        )}

        <div style={{ position: "absolute", inset: 0, top: "55%", background: "linear-gradient(to bottom,transparent,rgba(0,0,0,0.88))", pointerEvents: "none" }} />

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMobile ? "70px 18px 36px" : "16px 18px 18px", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarGrad(cur?.customerId), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 14, flexShrink: 0 }}>
              {initial(cur?.customerId)}
            </div>
            <div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontWeight: 500, fontSize: 12 }}>Verified Customer</div>
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 11, color: s <= (cur?.rating ?? 5) ? "#facc15" : "rgba(255,255,255,0.2)" }}>★</span>)}
              </div>
            </div>
          </div>
          {cur?.imageFeedback?.imageComment && (
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.55, marginBottom: 10, background: "rgba(0,0,0,0.35)", borderRadius: 10, padding: "8px 12px", backdropFilter: "blur(4px)" }}>
              "{cur.imageFeedback.imageComment}"
            </p>
          )}
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 8 }}>
              {images.map((_, i) => (
                <button key={i} onClick={() => !sliding && setIdx(i)} style={{
                  width: i === idx ? 22 : 8, height: 8, borderRadius: 4, padding: 0, border: "none", cursor: "pointer",
                  background: i === idx ? "#7c5cfc" : "rgba(255,255,255,0.4)",
                  transition: "width 0.25s ease, background 0.2s ease",
                }} />
              ))}
            </div>
          )}
          <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Swipe to navigate • {idx + 1} / {images.length}</div>
        </div>
      </div>
    </div>
  );
};

// ── Product Image Lightbox ────────────────────────────────────────────────────
const ImageLightbox = ({ images, productName, startIdx, imageUrl, onClose }) => {
  const [idx, setIdx]           = useState(startIdx);
  const [visible, setVisible]   = useState(false);
  const [sliding, setSliding]   = useState(false);
  const [slideDir, setSlideDir] = useState(0);
  const touchStartX             = useRef(0);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const goTo = useCallback((dir) => {
    if (sliding) return;
    setSlideDir(dir);
    setSliding(true);
    setTimeout(() => { setIdx(i => (i + dir + images.length) % images.length); setSlideDir(0); setSliding(false); }, 230);
  }, [sliding, images.length]);

  const prev = useCallback(() => goTo(-1), [goTo]);
  const next = useCallback(() => goTo(+1), [goTo]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000", opacity: visible ? 1 : 0, transition: "opacity 0.2s ease" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, zIndex: 20, width: 44, height: 44, borderRadius: "50%", background: "rgba(40,40,40,0.95)", border: "none", color: "#fff", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      {images.length > 1 && (
        <>
          <button onClick={prev} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, width: 48, height: 48, borderRadius: "50%", background: "rgba(40,40,40,0.9)", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <button onClick={next} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, width: 48, height: 48, borderRadius: "50%", background: "rgba(40,40,40,0.9)", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </>
      )}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
        <div
          onTouchStart={e => { touchStartX.current = e.changedTouches[0].screenX; }}
          onTouchEnd={e => {
            const diff = touchStartX.current - e.changedTouches[0].screenX;
            if (diff > 50) next(); if (diff < -50) prev();
          }}
          onClick={e => e.stopPropagation()}
          style={{
            position: "relative",
            width: isMobile ? "100vw" : "min(500px, 88vw)",
            height: isMobile ? "100vh" : "95vh",
            maxWidth: "100vw", maxHeight: "100vh",
            borderRadius: isMobile ? 0 : 22,
            overflow: "hidden", background: "#000",
            boxShadow: isMobile ? "none" : "0 30px 90px rgba(0,0,0,0.85)",
            opacity: sliding ? 0 : 1,
            transform: sliding ? `translateX(${slideDir < 0 ? "60px" : "-60px"})` : "translateX(0)",
            transition: "opacity 0.23s ease, transform 0.23s ease",
            touchAction: "pan-y pinch-zoom",
            WebkitUserSelect: "none", userSelect: "none", WebkitTouchCallout: "none",
          }}
        >
          {imageUrl(images[idx]) ? (
            <img src={imageUrl(images[idx])} alt={`${productName} — ${idx + 1}`} draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none" }}
            />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>No Image</div>
          )}
          <div style={{ position: "absolute", inset: 0, top: "55%", background: "linear-gradient(to bottom,transparent,rgba(0,0,0,0.82))", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: isMobile ? "70px 18px 28px" : "16px 18px 14px", zIndex: 2 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: isMobile ? 20 : 17, marginBottom: 8 }}>{productName}</div>
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 8, justifyContent: "center" }}>
                {images.map((_, i) => (
                  <button key={i} onClick={() => !sliding && setIdx(i)} style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 4, padding: 0, border: "none", cursor: "pointer", background: i === idx ? "#7c5cfc" : "rgba(255,255,255,0.45)", transition: "width 0.25s ease" }} />
                ))}
              </div>
            )}
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, textAlign: "center" }}>Swipe left/right to navigate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Expand Button ─────────────────────────────────────────────────────────────
const ExpandButton = ({ onClick }) => (
  <button onClick={onClick} title="View full image" style={{
    position: "absolute", top: 10, right: 10, zIndex: 20,
    width: 32, height: 32, borderRadius: 8,
    background: "rgba(14,19,32,0.82)", border: "1px solid rgba(160,120,255,0.4)",
    color: "#a078ff", display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", backdropFilter: "blur(6px)",
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  </button>
);

const hasSizes          = (p) => p?.sizeStock && Object.keys(p.sizeStock).length > 0;
const hasAnySizeInStock = (p) => hasSizes(p) && SIZES.some((s) => (p.sizeStock[s] ?? 0) > 0);

function RelatedSkeleton() {
  const shimmer = {
    background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
    backgroundSize: "600px 100%", animation: "sk-shimmer 1.4s infinite linear", borderRadius: 12,
  };
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ minWidth: 148, flexShrink: 0 }}>
          <div style={{ ...shimmer, aspectRatio: "1/1", width: "100%", borderRadius: 12 }} />
          <div style={{ marginTop: 8 }}>
            <div style={{ ...shimmer, height: 12, width: "75%", marginBottom: 6 }} />
            <div style={{ ...shimmer, height: 12, width: "50%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewSkeleton() {
  const shimmer = {
    background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
    backgroundSize: "600px 100%", animation: "sk-shimmer 1.4s infinite linear", borderRadius: 8,
  };
  return (
    <div style={{ background: "#12121a", border: "1px solid rgba(160,120,255,0.1)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ ...shimmer, width: 36, height: 36, borderRadius: "50%" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ ...shimmer, height: 12, width: "40%" }} />
          <div style={{ ...shimmer, height: 10, width: "25%" }} />
        </div>
      </div>
      <div style={{ ...shimmer, height: 12, width: "60%" }} />
      <div style={{ ...shimmer, height: 60 }} />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductView() {
  const navigate      = useNavigate();
  const { productId } = useParams();

  const [product,             setProduct]             = useState(null);
  const [loading,             setLoading]             = useState(true);
  const [imgIdx,              setImgIdx]              = useState(0);
  const [selSize,             setSelSize]             = useState(null);
  const [selColor,            setSelColor]            = useState(null);
  const [fixedBar,            setFixedBar]            = useState(false);
  const [authToast,           setAuthToast]           = useState(false);
  const [sizeToast,           setSizeToast]           = useState(false);
  const [sizeError,           setSizeError]           = useState(false);
  const [lightbox,            setLightbox]            = useState(false);
  const touchStartX           = useRef(0);
  const touchEndX             = useRef(0);

  const [custLightbox,        setCustLightbox]        = useState(false);
  const [custLightboxIdx,     setCustLightboxIdx]     = useState(0);
  const [showAllReviews,      setShowAllReviews]      = useState(false);
  const [expandedReview,      setExpandedReview]      = useState(null);

  // ── Feedback state ──────────────────────────────────────────────
  const [feedbackLoading,     setFeedbackLoading]     = useState(false);
  const [feedbackLoaded,      setFeedbackLoaded]      = useState(false); // true after first fetch completes
  const [avgRating,           setAvgRating]           = useState(0);
  const [totalCount,          setTotalCount]          = useState(0);
  const [ratingCounts,        setRatingCounts]        = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [imageFeedback,       setImageFeedback]       = useState([]);
  const [commentFeedback,     setCommentFeedback]     = useState([]);
  const [feedbackPage,        setFeedbackPage]        = useState(1);
  const [feedbackTotalPages,  setFeedbackTotalPages]  = useState(1);
  const [feedbackLoadingMore, setFeedbackLoadingMore] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading,  setRelatedLoading]  = useState(false);

  const productDetailsRef = useRef(null);
  const relatedScrollRef  = useRef(null);

  const handleTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX; };
  const handleTouchEnd   = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) next();
    if (diff < -50) prev();
  };

  const getDecryptedId = useCallback(() => {
    try {
      const bytes = CryptoJS.AES.decrypt(decodeURIComponent(productId), SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8) || null;
    } catch { return null; }
  }, [productId]);

  // ── Fetch product ───────────────────────────────────────────────
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const originalId = getDecryptedId();
        if (!originalId) throw new Error("Invalid product link");
        const res = await API.get(`/productBuy/fetchProductById/${originalId}`);
        if (res.data.success) {
          setProduct(res.data.data);
          if (res.data.data.color?.name) setSelColor(res.data.data.color.name);
        }
      } catch (err) {
        console.error("fetchProduct error:", err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, getDecryptedId]);

  // ── Fetch feedback once product is loaded ───────────────────────
  // Uses the decrypted MongoDB _id — same value that submitFeedback
  // receives when the feedback form posts productId from the URL.
  useEffect(() => {
    if (!productId) return;
    fetchFeedback(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchFeedback = async (page = 1, isFirstLoad = false) => {
    if (isFirstLoad) setFeedbackLoading(true);
    else setFeedbackLoadingMore(true);

    try {
      const originalId = getDecryptedId();
      if (!originalId) return;

      const res = await API.get(`/user/fetchFeedbackByProduct/${originalId}`, {
        params: { page, limit: 5 },
      });

      if (res.data.success) {
        setAvgRating(res.data.avgRating ?? 0);
        setTotalCount(res.data.totalCount ?? 0);
        setRatingCounts(res.data.ratingCounts ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

        if (isFirstLoad) {
          setImageFeedback(res.data.imageFeedback ?? []);
          setCommentFeedback(res.data.commentFeedback ?? []);
        } else {
          setCommentFeedback(prev => [...prev, ...(res.data.commentFeedback ?? [])]);
        }

        setFeedbackPage(res.data.meta?.page ?? 1);
        setFeedbackTotalPages(res.data.meta?.totalPages ?? 1);
      }
    } catch (err) {
      console.error("fetchFeedback error:", err);
    } finally {
      setFeedbackLoading(false);
      setFeedbackLoaded(true);
      setFeedbackLoadingMore(false);
    }
  };

  // ── Fetch related products ──────────────────────────────────────
  useEffect(() => {
    if (!product?.category) return;
    const fetchRelated = async () => {
      setRelatedLoading(true);
      try {
        const res = await API.get("/productBuy/fetchProductByCategory", {
          params: { category: product.category, page: 1, limit: 20 },
        });
        if (res.data.success) {
          const all = res.data.data.products || [];
          setRelatedProducts(all.filter((p) => p.id !== product.productId));
        }
      } catch (err) {
        console.error("fetchRelated error:", err);
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [product?.category, product?.productId]);

  // ── Scroll watcher ──────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (!productDetailsRef.current) return;
      setFixedBar(productDetailsRef.current.getBoundingClientRect().top >= window.innerHeight);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { if (selSize) setSizeError(false); }, [selSize]);

  const validateSize = () => {
    if (!product) return false;
    if (hasSizes(product) && hasAnySizeInStock(product) && !selSize) {
      setSizeError(true);
      setSizeToast(true);
      document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  const persistSize = () => {
    if (selSize) sessionStorage.setItem("selectedSize", selSize);
    else sessionStorage.removeItem("selectedSize");
  };

  const isLoggedIn = () => !!Cookies.get("user");

  const handleProtectedAction = (dest) => {
    if (!validateSize()) return;
    persistSize();
    if (isLoggedIn()) navigate(dest);
    else setAuthToast(true);
  };

  const handleCart      = () => handleProtectedAction("/product-checkout");
  const handleBuy       = () => handleProtectedAction(`/view-checkout/${encodeURIComponent(productId)}`);
  const handleGoToLogin = () => { setAuthToast(false); navigate("/login"); };

  const imageUrl = (path) => path ? (path.startsWith("/") ? `${BASE_URL}${path}` : path) : null;

  const images      = product?.images || [];
  const prev        = () => setImgIdx(i => (i - 1 + images.length) % images.length);
  const next        = () => setImgIdx(i => (i + 1) % images.length);
  const hasDiscount = product
    ? product.discount > 0 && product.finalPrice && product.finalPrice !== product.price
    : false;

  const ratingBars = [5, 4, 3, 2, 1].map((star) => {
    const count = ratingCounts[star] ?? 0;
    const pct   = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    return { label: `${star} ★`, pct, count };
  });

  const displayedStars = avgRating > 0 ? starString(avgRating) : "☆☆☆☆☆";

  // ── Derived flags — used to show/hide review section ──────────
  // Only show the reviews section after loading completes AND there is actual data.
  const hasAnyFeedback = feedbackLoaded && totalCount > 0;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:#0E1320}
        ::-webkit-scrollbar-thumb{background:rgba(160,120,255,0.3);border-radius:3px}
        .cinzel{font-family:'Cinzel',serif}
        @keyframes sk-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes size-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
        .reviews-scroll-wrap::-webkit-scrollbar{display:none}
        .reviews-scroll-wrap{scrollbar-width:none;-ms-overflow-style:none}
        .cust-img-thumb:hover{opacity:1!important;transform:scale(1.04);}
        .related-scroll::-webkit-scrollbar{height:0;display:none}
        .related-scroll{-ms-overflow-style:none;scrollbar-width:none;}
      `}</style>

      <AuthToast visible={authToast} onLogin={handleGoToLogin} onDismiss={() => setAuthToast(false)} />
      <SizeToast visible={sizeToast} onDismiss={() => setSizeToast(false)} />

      {lightbox && product && images.length > 0 && (
        <ImageLightbox images={images} productName={product.name} startIdx={imgIdx} imageUrl={imageUrl} onClose={() => setLightbox(false)} />
      )}
      {custLightbox && imageFeedback.length > 0 && (
        <CustomerImageLightbox images={imageFeedback} startIdx={custLightboxIdx} onClose={() => setCustLightbox(false)} />
      )}

      <div style={{ minHeight: "100vh", background: "#0E1320", color: "#e8e0ff", fontFamily: "'Raleway',sans-serif" }}>

        {loading && <ProductViewSkeleton />}

        {!loading && !product && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, color: "rgba(255,255,255,0.3)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ fontSize: 14 }}>Product not found.</p>
            <button onClick={() => navigate(-1)} style={{ fontSize: 12, color: "#c084fc", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Go back</button>
          </div>
        )}

        {!loading && product && (
          <div style={{ maxWidth: 1152, margin: "0 auto", padding: "2rem 1.25rem" }}>

            {/* ── Main Grid ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "2.5rem", alignItems: "start" }}>

              {/* LEFT — Images */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%", overflow: "hidden" }}>
                <div style={{
                  position: "relative", background: "#12121a",
                  border: "1px solid rgba(160,120,255,0.15)",
                  borderRadius: window.innerWidth <= 768 ? 0 : 16,
                  overflow: "hidden", margin: "0 auto",
                  width: window.innerWidth <= 768 ? "100%" : "min(100%,70%)",
                  height: window.innerWidth <= 768 ? "62vh" : undefined,
                  aspectRatio: window.innerWidth <= 768 ? undefined : "4/5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: window.innerWidth <= 768 ? "none" : "0 0 40px rgba(160,120,255,0.07)",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%,rgba(160,120,255,0.07) 0%,transparent 60%)", pointerEvents: "none" }} />
                  <ExpandButton onClick={() => setLightbox(true)} />
                  {imageUrl(images[imgIdx]) ? (
                    <img src={imageUrl(images[imgIdx])} alt={product.name} onClick={() => setLightbox(true)}
                      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                      style={{ width: "100%", height: "100%", maxHeight: window.innerWidth <= 768 ? "unset" : "100%", objectFit: "cover", objectPosition: "top", display: "block", cursor: "pointer", filter: "drop-shadow(0 8px 32px rgba(160,120,255,0.22))" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", color: "#8880aa", fontSize: 14 }}>No Image</div>
                  )}
                  {images.length > 1 && (
                    <>
                      <button onClick={prev} style={{ position: "absolute", left: window.innerWidth <= 768 ? 6 : 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(14,19,32,0.78)", backdropFilter: "blur(8px)", border: "1px solid rgba(160,120,255,0.3)", color: "#a078ff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>‹</button>
                      <button onClick={next} style={{ position: "absolute", right: window.innerWidth <= 768 ? 6 : 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", background: "rgba(14,19,32,0.78)", backdropFilter: "blur(8px)", border: "1px solid rgba(160,120,255,0.3)", color: "#a078ff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>›</button>
                    </>
                  )}
                  <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} style={{ width: i === imgIdx ? 20 : 8, height: 8, borderRadius: 4, padding: 0, border: "none", cursor: "pointer", background: i === imgIdx ? "#a078ff" : "rgba(160,120,255,0.3)", transition: "width 0.25s ease" }} />
                    ))}
                  </div>
                </div>

                {images.length > 1 && (
                  <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {images.map((src, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", border: i === imgIdx ? "2px solid #a078ff" : "2px solid rgba(160,120,255,0.15)", boxShadow: i === imgIdx ? "0 0 10px rgba(160,120,255,0.4)" : "none", opacity: i === imgIdx ? 1 : 0.6, flexShrink: 0, padding: 0, cursor: "pointer", transition: "all 0.2s" }}>
                        <img src={imageUrl(src)} alt={`thumb ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — Details */}
              <div style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, color: "#e8e0ff", fontFamily: "'Poppins', sans-serif" }}>
                  {product.name}
                </div>

                {hasSizes(product) && (
                  <div id="size-selector">
                    <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, color: sizeError ? "#fb923c" : "#8880aa" }}>
                      Select Size
                      {sizeError && <span style={{ fontSize: 10, color: "#fb923c", fontWeight: 700, background: "rgba(251,146,60,0.1)", padding: "2px 8px", borderRadius: 999 }}>← required</span>}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, animation: sizeError ? "size-shake 0.35s ease" : "none" }}>
                      {SIZES.map((s) => {
                        const qty        = product.sizeStock[s] ?? 0;
                        const outOfStock = qty === 0;
                        const isSelected = selSize === s;
                        const isErr      = sizeError && !outOfStock && !isSelected;
                        return (
                          <button key={s} onClick={() => !outOfStock && setSelSize(s)} disabled={outOfStock} style={{
                            width: 40, height: 40, borderRadius: 10, fontSize: 14, fontWeight: 600,
                            cursor: outOfStock ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                            border: outOfStock ? "1px solid rgba(160,120,255,0.08)" : isSelected ? "1px solid #a078ff" : isErr ? "1px solid rgba(255,120,80,0.5)" : "1px solid rgba(160,120,255,0.22)",
                            background: outOfStock ? "#0E1320" : isSelected ? "rgba(160,120,255,0.13)" : "#0E1320",
                            color: outOfStock ? "#3a3456" : isSelected ? "#a078ff" : isErr ? "#fda47a" : "#e8e0ff",
                            boxShadow: isSelected ? "0 0 10px rgba(160,120,255,0.22)" : "none",
                            transition: "all 0.2s",
                          }}>
                            {s}
                            {outOfStock && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ position: "absolute", width: "100%", height: 1, background: "#3a3456", transform: "rotate(45deg)" }} /></span>}
                          </button>
                        );
                      })}
                    </div>
                    {selSize && (
                      <div style={{ marginTop: 8, fontSize: 12, color: "#a078ff", fontWeight: 600 }}>
                        Selected: <span style={{ background: "rgba(160,120,255,0.13)", padding: "2px 10px", borderRadius: 999 }}>{selSize}</span>
                      </div>
                    )}
                  </div>
                )}

                {product.color && (
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8880aa", marginBottom: 10 }}>Color</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button title={product.color.name} onClick={() => setSelColor(product.color.name)} style={{ width: 32, height: 32, borderRadius: "50%", background: product.color.hex, border: "2px solid transparent", cursor: "pointer", outline: selColor === product.color.name ? "2px solid #a078ff" : "none", outlineOffset: 2, transition: "transform 0.2s" }} />
                      {selColor && <span style={{ fontSize: 12, color: "#8880aa" }}>{selColor}</span>}
                    </div>
                  </div>
                )}

                <div style={{ height: 1, background: "rgba(160,120,255,0.13)" }} />

                <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                  <div className="cinzel" style={{ fontSize: 32, fontWeight: 700, color: "#17ec03" }}>
                    ₹{hasDiscount ? product.finalPrice : product.price}
                  </div>
                  {hasDiscount && (
                    <>
                      <div style={{ fontSize: 16, color: "#8880aa", textDecoration: "line-through" }}>₹{product.price}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "2px 10px", borderRadius: 999 }}>
                        {product.discount}% OFF
                      </div>
                    </>
                  )}
                </div>

                <div style={{ height: 1, background: "rgba(160,120,255,0.13)" }} />

                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8880aa", marginBottom: 10 }}>Delivery Details</div>
                  <div style={{ background: "#12121a", border: "1px solid rgba(160,120,255,0.13)", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                      <HiHomeModern size={20} style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, color: "#8880aa" }}>Delivering to</div>
                        <div style={{ fontWeight: 500, color: "#e8e0ff" }}>Udaynarayanpur, West Bengal 711226</div>
                      </div>
                    </div>
                    <div style={{ height: 1, background: "rgba(160,120,255,0.09)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                      <MdDeliveryDining size={24} style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, color: "#8880aa" }}>Estimated Delivery</div>
                        <div style={{ fontWeight: 500, color: "#e8e0ff" }}>
                          <span style={{ color: "#4ade80", fontWeight: 600 }}>{product.delivery}</span> — Free
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div ref={productDetailsRef}>
                  <CTAButtons onCart={handleCart} onBuy={handleBuy} sizeError={sizeError} />
                </div>
              </div>
            </div>

            {/* ── Product Details ── */}
            {product.details && product.details.length > 0 && (
              <div style={{ marginTop: 40 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8880aa", marginBottom: 10 }}>Product Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                  {product.details.map((d, i) => (
                    <div key={i} style={{ background: "#12121a", border: "1px solid rgba(160,120,255,0.13)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 10, color: "#8880aa", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>{d.field}</div>
                      <div style={{ fontSize: 14, color: "#e8e0ff", fontWeight: 500 }}>{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════
                CUSTOMER REVIEWS — only rendered when there IS data
                While loading: show skeletons.
                After load with no data: render nothing at all.
            ════════════════════════════════════════════════════ */}
            {(feedbackLoading || hasAnyFeedback) && (
              <div style={{ marginTop: 56 }}>
                <div className="cinzel" style={{ fontSize: 18, fontWeight: 700, color: "#e8e0ff", marginBottom: 4 }}>Customer Reviews</div>
                <div style={{ fontSize: 13, color: "#8880aa", marginBottom: 24 }}>Verified purchases from Midnight Aura shoppers</div>

                {/* ── Customer image strip — only if there are image reviews ── */}
                {(feedbackLoading || imageFeedback.length > 0) && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#a078ff", marginBottom: 12 }}>
                      <FaCamera style={{ flexShrink: 0 }} />
                      <span>Photos by customers</span>
                      {!feedbackLoading && (
                        <span style={{ fontSize: 11, color: "#8880aa", fontWeight: 400 }}>
                          ({imageFeedback.length} photo{imageFeedback.length !== 1 ? "s" : ""})
                        </span>
                      )}
                    </div>

                    {feedbackLoading ? (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, maxWidth: 420 }}>
                        {[0,1,2,3].map(i => (
                          <div key={i} style={{ aspectRatio: "1/1", borderRadius: 12, background: "rgba(255,255,255,0.05)", animation: "sk-shimmer 1.4s infinite linear" }} />
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, maxWidth: 420 }}>
                        {imageFeedback.slice(0, 4).map((fb, i) => {
                          const remaining = imageFeedback.length - 4;
                          const isLast    = i === 3 && remaining > 0;
                          return (
                            <button
                              key={fb._id ?? i}
                              className="cust-img-thumb"
                              onClick={() => { setCustLightboxIdx(i); setCustLightbox(true); }}
                              style={{
                                position: "relative", width: "100%", aspectRatio: "1/1",
                                borderRadius: 12, overflow: "hidden",
                                border: "2px solid rgba(160,120,255,0.2)",
                                padding: 0, cursor: "pointer", opacity: 0.9,
                                transition: "0.25s", background: "#111827",
                              }}
                            >
                              {fb.imageFeedback?.imageData ? (
                                <img src={fb.imageFeedback.imageData} alt={`Customer photo ${i + 1}`}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <div style={{
                                  width: "100%", height: "100%",
                                  background: `linear-gradient(135deg, hsl(${(i * 47 + 240) % 360},40%,18%), hsl(${(i * 47 + 280) % 360},40%,12%))`,
                                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                                }}>
                                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(160,120,255,0.55)" strokeWidth="1.4">
                                    <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                                  </svg>
                                </div>
                              )}
                              {isLast && (
                                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 700, backdropFilter: "blur(3px)" }}>
                                  +{remaining}
                                </div>
                              )}
                              <div style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.72)", borderRadius: 6, padding: "2px 5px", fontSize: 9, color: "#facc15", fontWeight: 700, backdropFilter: "blur(4px)" }}>
                                ★ {fb.rating}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Rating summary ── */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 32,
                  background: "#12121a", border: "1px solid rgba(160,120,255,0.13)",
                  borderRadius: 16, padding: "20px 24px", marginBottom: 24, flexWrap: "wrap",
                }}>
                  {feedbackLoading ? (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 56, borderRadius: 8, background: "rgba(255,255,255,0.05)", animation: "sk-shimmer 1.4s infinite linear" }} />
                        <div style={{ width: 100, height: 20, borderRadius: 6, background: "rgba(255,255,255,0.04)", animation: "sk-shimmer 1.4s infinite linear" }} />
                        <div style={{ width: 70, height: 12, borderRadius: 5, background: "rgba(255,255,255,0.04)", animation: "sk-shimmer 1.4s infinite linear" }} />
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 176 }}>
                        {[0,1,2,3,4].map(i => (
                          <div key={i} style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.05)", animation: "sk-shimmer 1.4s infinite linear" }} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ textAlign: "center" }}>
                        <div className="cinzel" style={{ fontSize: 52, fontWeight: 700, color: "#facc15", lineHeight: 1 }}>{avgRating.toFixed(1)}</div>
                        <div style={{ color: "#facc15", fontSize: 20, margin: "4px 0", letterSpacing: 2 }}>{displayedStars}</div>
                        <div style={{ fontSize: 12, color: "#8880aa" }}>{totalCount.toLocaleString("en-IN")} rating{totalCount !== 1 ? "s" : ""}</div>
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 176 }}>
                        {ratingBars.map((b, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#8880aa" }}>
                            <span style={{ minWidth: 28 }}>{b.label}</span>
                            <div style={{ flex: 1, height: 6, background: "#1a1a26", borderRadius: 999, overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 999, width: `${b.pct}%`, background: "linear-gradient(90deg,#facc15,#a078ff)", transition: "width 0.6s ease" }} />
                            </div>
                            <span style={{ minWidth: 28, textAlign: "right" }}>{b.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* ── Comment Reviews — only if there are comment reviews ── */}
                {(feedbackLoading || commentFeedback.length > 0) && (
                  <>
                    <div style={{ position: "relative" }}>
                      <div
                        className="reviews-scroll-wrap"
                        style={{
                          display: "flex", gap: 14,
                          overflowX: window.innerWidth <= 768 ? "auto" : "visible",
                          flexDirection: window.innerWidth <= 768 ? "row" : "column",
                          paddingBottom: 6,
                          scrollSnapType: window.innerWidth <= 768 ? "x mandatory" : "none",
                        }}
                      >
                        {feedbackLoading ? (
                          [0, 1].map(i => (
                            <div key={i} style={{ minWidth: window.innerWidth <= 768 ? "82vw" : "100%", maxWidth: window.innerWidth <= 768 ? "82vw" : "100%", flexShrink: 0 }}>
                              <ReviewSkeleton />
                            </div>
                          ))
                        ) : (
                          (window.innerWidth <= 768
                            ? commentFeedback
                            : (showAllReviews ? commentFeedback : commentFeedback.slice(0, 1))
                          ).map((r, i) => (
                            <div key={r._id ?? i} style={{
                              background: "#12121a", border: "1px solid rgba(160,120,255,0.13)",
                              borderRadius: 16, padding: "20px", transition: "border-color 0.2s",
                              minWidth: window.innerWidth <= 768 ? "82vw" : "100%",
                              maxWidth: window.innerWidth <= 768 ? "82vw" : "100%",
                              flexShrink: 0, scrollSnapAlign: "start",
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: avatarGrad(r.customerId), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 14 }}>
                                  {initial(r.customerId)}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e0ff" }}>Verified Customer</div>
                                  <div style={{ fontSize: 11, color: "#8880aa", marginTop: 2 }}>{fmtDate(r.submittedAt)}</div>
                                </div>
                                <div style={{ fontSize: 14 }}><Stars n={r.rating} /></div>
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#a078ff", marginBottom: 6 }}>
                                {r.commentFeedback?.title}
                              </div>
                              <div style={{
                                fontSize: 14, color: "#b0a8cc", lineHeight: 1.65,
                                display: window.innerWidth <= 768 && expandedReview !== i ? "-webkit-box" : "block",
                                WebkitLineClamp: window.innerWidth <= 768 && expandedReview !== i ? 2 : "unset",
                                WebkitBoxOrient: "vertical",
                                overflow: window.innerWidth <= 768 && expandedReview !== i ? "hidden" : "visible",
                              }}>
                                {r.commentFeedback?.description}
                              </div>
                              {window.innerWidth <= 768 && (r.commentFeedback?.description?.length ?? 0) > 80 && (
                                <button onClick={() => setExpandedReview(expandedReview === i ? null : i)}
                                  style={{ marginTop: 8, background: "none", border: "none", color: "#a078ff", fontSize: 13, cursor: "pointer", padding: 0, fontWeight: 600 }}
                                >
                                  {expandedReview === i ? "Show less" : "Read more"}
                                </button>
                              )}
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "3px 10px", borderRadius: 999, marginTop: 10 }}>
                                ✔ Verified Purchase
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Load More / Show All — desktop */}
                    {!feedbackLoading && commentFeedback.length > 0 && (
                      <div style={{ display: window.innerWidth <= 768 ? "none" : "flex", justifyContent: "flex-end", marginTop: 16, gap: 10 }}>
                        {showAllReviews && feedbackPage < feedbackTotalPages && (
                          <button
                            onClick={() => fetchFeedback(feedbackPage + 1, false)}
                            disabled={feedbackLoadingMore}
                            style={{ background: "rgba(160,120,255,0.06)", border: "1px solid rgba(160,120,255,0.2)", borderRadius: 12, padding: "10px 24px", color: "#8880aa", fontSize: 13, fontWeight: 600, cursor: feedbackLoadingMore ? "not-allowed" : "pointer" }}
                          >
                            {feedbackLoadingMore ? "Loading…" : "Load more reviews"}
                          </button>
                        )}
                        <button
                          onClick={() => setShowAllReviews(v => !v)}
                          style={{ background: "rgba(160,120,255,0.08)", border: "1px solid rgba(160,120,255,0.3)", borderRadius: 12, padding: "10px 28px", color: "#a078ff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                        >
                          {showAllReviews ? "Show less ↑" : "Read all reviews →"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Related Products ── */}
            <div style={{ marginTop: 56, paddingBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
                <div className="cinzel" style={{ fontSize: 18, fontWeight: 700, color: "#e8e0ff" }}>Similar Products</div>
              </div>

              {relatedLoading && <RelatedSkeleton />}

              {!relatedLoading && relatedProducts.length === 0 && (
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, padding: "24px 0" }}>No related products found.</div>
              )}

              {!relatedLoading && relatedProducts.length > 0 && (
                <div
                  ref={relatedScrollRef}
                  className="related-scroll"
                  style={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch", cursor: "grab", scrollSnapType: "x mandatory", paddingBottom: 4, userSelect: "none" }}
                  onMouseDown={e => {
                    const el = relatedScrollRef.current;
                    el.dataset.isDragging = "true";
                    el.dataset.startX = e.pageX - el.offsetLeft;
                    el.dataset.scrollLeft = el.scrollLeft;
                    el.style.cursor = "grabbing";
                  }}
                  onMouseMove={e => {
                    const el = relatedScrollRef.current;
                    if (el.dataset.isDragging !== "true") return;
                    const x = e.pageX - el.offsetLeft;
                    el.scrollLeft = parseFloat(el.dataset.scrollLeft) - (x - parseFloat(el.dataset.startX)) * 1.2;
                  }}
                  onMouseUp={() => { relatedScrollRef.current.dataset.isDragging = "false"; relatedScrollRef.current.style.cursor = "grab"; }}
                  onMouseLeave={() => { relatedScrollRef.current.dataset.isDragging = "false"; relatedScrollRef.current.style.cursor = "grab"; }}
                >
                  <div style={{ display: "flex", gap: 14, width: "max-content", paddingBottom: 8 }}>
                    {relatedProducts.map((p, i) => (
                      <div key={p.id ?? p._id ?? i} style={{ width: window.innerWidth <= 768 ? "72vw" : 180, flexShrink: 0, scrollSnapAlign: "start" }}>
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── Fixed bottom CTA bar (mobile) ── */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
          transition: "transform 0.3s ease",
          transform: fixedBar ? "translateY(0)" : "translateY(100%)",
          display: window.innerWidth <= 768 ? "block" : "none",
        }}>
          <div style={{ padding: "12px 16px 16px", background: "linear-gradient(to top,rgba(14,19,32,0.98),rgba(14,19,32,0.85))", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(160,120,255,0.15)" }}>
            <CTAButtons compact onCart={handleCart} onBuy={handleBuy} sizeError={sizeError} />
          </div>
        </div>

      </div>
    </>
  );
}