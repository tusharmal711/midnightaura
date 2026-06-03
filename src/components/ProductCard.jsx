import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import { API } from "../api";

const BASE_URL   = "http://localhost:8008";
const SECRET_KEY = "midnightaura_secret_key";

const encryptId = (id) =>
  encodeURIComponent(CryptoJS.AES.encrypt(id, SECRET_KEY).toString());

// ── Get stored email (mirrors Order.jsx exactly) ──────────────────────────────
const getStoredEmail = () => {
  try {
    const s = localStorage.getItem("user");
    if (s) { const p = JSON.parse(s); if (p?.email) return p.email; }
  } catch (_) {}
  try {
    const c = Cookies.get("user");
    if (c) { const p = JSON.parse(c); if (p?.email) return p.email; }
  } catch (_) {}
  return null;
};

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating = ({ avg }) => {
  const rounded = Math.round(avg);
  const label   = avg % 1 === 0 ? String(avg) : avg.toFixed(1);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 1 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            style={{
              fontSize: 13,
              lineHeight: 1,
              color: s <= rounded ? "#facc15" : "rgba(255,255,255,0.18)",
            }}
          >
            ★
          </span>
        ))}
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#facc15", letterSpacing: "0.02em" }}>
        ({label})
      </span>
    </div>
  );
};

// ── Rating Skeleton ───────────────────────────────────────────────────────────
const RatingSkeleton = () => (
  <div
    style={{
      height: 13, width: 80, borderRadius: 4, marginBottom: 3,
      background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
      backgroundSize: "300px 100%",
      animation: "sk-shimmer 1.4s infinite linear",
    }}
  />
);

// ── Toast Notification ────────────────────────────────────────────────────────
const Toast = ({ message, type }) => {
  const colors = {
    success: { bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.35)",  text: "#4ade80",  icon: "M5 13l4 4L19 7" },
    error:   { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.35)",  text: "#f87171",  icon: "M18 6L6 18M6 6l12 12" },
    info:    { bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.35)", text: "#c4b5fd",  icon: "M13 16h-1v-4h-1m1-4h.01" },
  };
  const c = colors[type] || colors.info;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 18px",
        borderRadius: 14,
        background: c.bg,
        border: `1px solid ${c.border}`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        animation: "toast-in 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards",
        whiteSpace: "nowrap",
        maxWidth: "90vw",
      }}
    >
      <span
        style={{
          width: 24, height: 24, borderRadius: "50%",
          background: `rgba(255,255,255,0.08)`,
          border: `1px solid ${c.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.text} strokeWidth="2.5" strokeLinecap="round">
          <path d={c.icon} />
        </svg>
      </span>
      <span style={{ fontSize: 13, fontWeight: 600, color: c.text, letterSpacing: "0.01em" }}>
        {message}
      </span>
    </div>
  );
};

// ── Constants ─────────────────────────────────────────────────────────────────
const SIZES = ["S", "M", "L", "XL", "XXL"];

const hasSizes = (p) =>
  p?.sizeStock && Object.keys(p.sizeStock).length > 0;

const hasAnySizeInStock = (p) =>
  hasSizes(p) && SIZES.some((s) => (p.sizeStock[s] ?? 0) > 0);

// ── Size Picker Modal (Glass) ─────────────────────────────────────────────────
const SizePicker = ({ product, onClose, onConfirm, isLoading = false }) => {
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <style>{`
        @keyframes glass-pop-in {
          0%   { opacity: 0; transform: scale(0.88) translateY(12px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes toast-in {
          0%   { opacity: 0; transform: translateX(-50%) translateY(16px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .glass-picker {
          animation: glass-pop-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.12) inset;
        }
        .size-btn {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.18);
          color: #ffffff;
          transition: all 0.15s ease;
        }
        .size-btn:hover:not(:disabled) {
          background: rgba(168,85,247,0.25);
          border-color: rgba(168,85,247,0.6);
          transform: translateY(-1px);
        }
        .size-btn.selected {
          background: rgba(168,85,247,0.35);
          border-color: #a855f7;
          box-shadow: 0 0 12px rgba(168,85,247,0.4);
          color: #ffffff;
        }
        .size-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          text-decoration: line-through;
          color: rgba(255,255,255,0.4);
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: 99999, background: "rgba(0,0,0,0.65)" }}
        onClick={onClose}
      >
        {/* Glass Card */}
        <div
          className="glass-picker rounded-2xl p-6 w-[320px] relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Close button ── */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.8)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l10 10M11 1L1 11" />
            </svg>
          </button>

          {/* ── Title ── */}
          <h3 className="text-base font-semibold mb-1" style={{ color: "#ffffff", letterSpacing: "0.01em" }}>
            Select Size
          </h3>
          <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.45)" }}>
            {product?.name}
          </p>

          {/* ── Size Buttons ── */}
          <div className="flex gap-2 flex-wrap mb-5">
            {SIZES.map((size) => {
              const stock     = product?.sizeStock?.[size] ?? 0;
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  disabled={stock <= 0}
                  onClick={() => stock > 0 && setSelectedSize(size)}
                  className={`size-btn px-4 py-2 rounded-xl text-sm font-semibold ${isSelected ? "selected" : ""}`}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* ── Low stock hint ── */}
          {selectedSize && (product?.sizeStock?.[selectedSize] ?? 0) <= 5 && (
            <p className="text-xs mb-3" style={{ color: "#fb923c" }}>
              Only {product.sizeStock[selectedSize]} left in {selectedSize}!
            </p>
          )}

          {/* ── Add to Cart button ── */}
          <button
            disabled={!selectedSize || isLoading}
            onClick={() => onConfirm(selectedSize)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              background: selectedSize && !isLoading
                ? "linear-gradient(135deg, #9333ea, #db2777)"
                : "rgba(255,255,255,0.08)",
              color: selectedSize && !isLoading ? "#fff" : "rgba(255,255,255,0.3)",
              border: selectedSize && !isLoading
                ? "1px solid rgba(168,85,247,0.5)"
                : "1px solid rgba(255,255,255,0.1)",
              cursor: selectedSize && !isLoading ? "pointer" : "not-allowed",
              boxShadow: selectedSize && !isLoading ? "0 4px 20px rgba(147,51,234,0.4)" : "none",
              letterSpacing: "0.02em",
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Adding…
              </>
            ) : selectedSize ? (
              `Add ${selectedSize} to Cart`
            ) : (
              "Pick a size first"
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const navigate = useNavigate();

  // ── Customer ID (same pattern as Order.jsx) ──────────────────────────────
  const [customerId,   setCustomerId]   = useState(null);

  // ── Cart states ──────────────────────────────────────────────────────────
  const [showPicker,   setShowPicker]   = useState(false);
  const [added,        setAdded]        = useState(false);
  const [cartLoading,  setCartLoading]  = useState(false);
  const [toast,        setToast]        = useState(null);  // { message, type }

  // ── UI states ────────────────────────────────────────────────────────────
  const [loaded,       setLoaded]       = useState(false);
  const [ratingState,  setRatingState]  = useState({ status: "idle", avg: 0 });

  const cardRef    = useRef(null);
  const hasFetched = useRef(false);
  const toastTimer = useRef(null);

  // ── Fetch customerId from profile (mirrors Order.jsx) ────────────────────
  useEffect(() => {
    const fetchCustomerId = async () => {
      try {
        const email = getStoredEmail();
        if (!email) return;
        const res = await API.post("/user/getProfile", { email });
        if (res.data.success) {
          setCustomerId(res.data.user?.customerId || null);
        }
      } catch (err) {
        console.error("[ProductCard] fetchCustomerId error:", err);
      }
    };
    fetchCustomerId();
  }, []);

  // ── Lazy-fetch rating on scroll into view ─────────────────────────────────
  useEffect(() => {
    if (!product?.id) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasFetched.current) {
          hasFetched.current = true;
          fetchRating();
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const fetchRating = async () => {
    setRatingState((s) => ({ ...s, status: "loading" }));
    try {
      const res = await API.get(`/user/fetchFeedbackByProduct/${product.id}`, {
        params: { page: 1, limit: 1 },
      });
      if (res.data.success) {
        setRatingState({ status: "done", avg: res.data.avgRating ?? 0 });
      } else {
        setRatingState({ status: "done", avg: 0 });
      }
    } catch {
      setRatingState({ status: "done", avg: 0 });
    }
  };

  // ── Show toast helper ─────────────────────────────────────────────────────
  const showToast = (message, type = "info", duration = 2800) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), duration);
  };

  // ── Add to Cart → calls POST /cart/addToCart ──────────────────────────────
  const addToCart = async (size) => {
    if (!customerId) {
      showToast("Please log in to add items to cart", "error");
      return;
    }

    setCartLoading(true);
    try {
      const res = await API.post("/cart/addToCart", {
        customerId,
        productId: product.id,
        ...(size ? { size } : {}),    // only send size if present
      });

      if (res.data.success) {
        setAdded(true);
        setShowPicker(false);
        showToast(
          size
            ? `${product?.name} (${size}) added to cart!`
            : `${product?.name} added to cart!`,
          "success"
        );
        setTimeout(() => setAdded(false), 1500);
      } else {
        showToast(res.data.message || "Could not add to cart", "error");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add to cart. Try again.";
      showToast(msg, "error");
    } finally {
      setCartLoading(false);
    }
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (hasSizes(product) && hasAnySizeInStock(product)) {
      setShowPicker(true);
      return;
    }
    addToCart(null);
  };

  const handleProductClick = () => {
    if (product?.id) navigate(`/product-view/${encryptId(product.id)}`);
  };

  const hasDiscount =
    product?.discount > 0 &&
    product?.finalPrice &&
    product?.finalPrice !== product?.price;

  const imgSrc = product?.image
    ? product.image.startsWith("/")
      ? `${BASE_URL}${product.image}`
      : product.image
    : null;

  const { status, avg } = ratingState;

  return (
    <>
      <style>{`
        @keyframes sk-shimmer {
          0%   { background-position: -300px 0; }
          100% { background-position:  300px 0; }
        }
        @keyframes toast-in {
          0%   { opacity: 0; transform: translateX(-50%) translateY(16px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* ── Toast ── */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div
        ref={cardRef}
        className="bg-[#141928] border border-white/[0.06] rounded-2xl overflow-hidden group hover:border-purple-500/30 transition-all shadow-lg hover:shadow-purple-900/20"
      >
        {/* ── Product Image ── */}
        <div
          onClick={handleProductClick}
          className="relative bg-[#0f1420] aspect-square flex items-center justify-center overflow-hidden cursor-pointer"
        >
          {!loaded && (
            <div className="absolute inset-0 bg-white/10 animate-pulse z-10" />
          )}

          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className={`
                w-full h-full object-cover transition-all duration-500
                group-hover:scale-105
                ${loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105"}
              `}
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <svg viewBox="0 0 120 130" width="90" height="100" className="opacity-60">
                <path
                  d="M30 8 L18 28 L2 20 L14 50 L20 50 L20 122 L100 122 L100 50 L106 50 L118 20 L102 28 L90 8 Q60 18 30 8Z"
                  fill={product?.color || "#1a1a2e"}
                  stroke="#2a1a4a"
                  strokeWidth="1"
                />
                {product?.graphic && (
                  <text x="60" y="80" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="serif">
                    {product.graphic}
                  </text>
                )}
              </svg>
            </div>
          )}

          <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/5 transition-colors" />
        </div>

        {/* ── Product Info ── */}
        <div className="flex items-center justify-between px-3 py-2.5">
          <div onClick={handleProductClick} className="cursor-pointer flex-1 mr-2">

            {/* Name */}
            <p className="text-sm font-medium text-white/90 leading-tight mb-1">
              {product?.name}
            </p>

            {/* Rating */}
            {status === "loading" && <RatingSkeleton />}
            {status === "done" && avg > 0 && <StarRating avg={avg} />}

            {/* Price */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-white">
                ₹{hasDiscount ? product.finalPrice : product.price}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "line-through" }}>
                    ₹{product.price}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "#4ade80" }}>
                    {product.discount}% off
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ── Cart Button ── */}
          <button
            onClick={handleAdd}
            disabled={cartLoading}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
              added
                ? "bg-green-500"
                : cartLoading
                  ? "bg-purple-800 cursor-wait"
                  : "bg-gradient-to-br from-pink-600 to-purple-700 hover:scale-110"
            } shadow-lg`}
          >
            {added ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : cartLoading ? (
              <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Size Picker Modal ── */}
      {showPicker && (
        <SizePicker
          product={product}
          onClose={() => setShowPicker(false)}
          onConfirm={addToCart}
          isLoading={cartLoading}
        />
      )}
    </>
  );
}