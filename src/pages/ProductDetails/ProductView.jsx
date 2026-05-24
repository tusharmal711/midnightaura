import { useState, useEffect, useRef, useCallback } from "react";
import { IoIosFlash } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";
import { HiHomeModern } from "react-icons/hi2";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { API } from "../../api";
import CryptoJS from "crypto-js";

const SECRET_KEY = "midnightaura_secret_key";
const BASE_URL   = "http://localhost:8008";
const SIZES      = ["S", "M", "L", "XL", "XXL"];

const RATING_BARS = [
  { label: "5 ★", pct: 58 },
  { label: "4 ★", pct: 22 },
  { label: "3 ★", pct: 10 },
  { label: "2 ★", pct: 5  },
  { label: "1 ★", pct: 5  },
];

const REVIEWS = [
  {
    name: "Anjali Sharma", initial: "A",
    avatarGrad: "linear-gradient(135deg,#a078ff,#ff6eb4)",
    date: "12 May 2025", stars: 5,
    title: "Absolutely worth every rupee!",
    body: "The print quality is stunning — colours come out vibrant and true to life. Set up was super easy via Wi-Fi and I was printing within minutes.",
    verified: true,
  },
  {
    name: "Rahul Das", initial: "R",
    avatarGrad: "linear-gradient(135deg,#4ade80,#06b6d4)",
    date: "3 Apr 2025", stars: 4,
    title: "Great for home office use",
    body: "Scanning and copying work flawlessly. The Wi-Fi connection is stable. Only minor gripe is that it can be a bit slow for large photo prints.",
    verified: true,
  },
  {
    name: "Priya Mukherjee", initial: "P",
    avatarGrad: "linear-gradient(135deg,#f0c060,#ff6eb4)",
    date: "19 Mar 2025", stars: 5,
    title: "Best product I have ever owned",
    body: "Replaced my old one with this and the difference is night and day. Build quality feels solid and premium. Highly recommend!",
    verified: true,
  },
];

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ n }) =>
  [1, 2, 3, 4, 5].map((s) => (
    <span key={s} className={s <= n ? "text-yellow-400" : "text-[#3a3456]"}>★</span>
  ));

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ProductViewSkeleton() {
  const shimmer = {
    background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
    backgroundSize: "600px 100%",
    animation: "sk-shimmer 1.4s infinite linear",
    borderRadius: 10,
  };
  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div style={{ ...shimmer, aspectRatio: "4/5", width: "70%", margin: "0 auto", borderRadius: 16 }} />
        <div className="flex flex-col gap-4 pt-2">
          <div style={{ ...shimmer, height: 28, width: "80%" }} />
          <div style={{ ...shimmer, height: 16, width: "50%" }} />
          <div style={{ ...shimmer, height: 36, width: "40%" }} />
          <div className="flex gap-2 mt-2">
            {[1,2,3,4,5].map(i => <div key={i} style={{ ...shimmer, width: 40, height: 40, borderRadius: 10 }} />)}
          </div>
          <div style={{ ...shimmer, height: 100, borderRadius: 14, marginTop: 8 }} />
          <div style={{ ...shimmer, height: 52, borderRadius: 14 }} />
        </div>
      </div>
    </div>
  );
}

// ── Auth Toast ────────────────────────────────────────────────────────────────
const AuthToast = ({ visible, onLogin, onDismiss }) => (
  <div className={`fixed inset-0 z-[60] flex items-end justify-center pb-10 px-4 pointer-events-none transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
    <div className={`pointer-events-auto w-full max-w-sm bg-[#1a1730] border border-[rgba(160,120,255,0.35)] rounded-2xl px-5 py-4 shadow-[0_0_40px_rgba(160,120,255,0.25)] transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-8"}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[rgba(160,120,255,0.15)] flex items-center justify-center shrink-0 text-lg">🔐</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#e8e0ff] mb-0.5">Login required</div>
          <div className="text-xs text-[#8880aa] leading-relaxed">Please sign in to continue with your purchase.</div>
        </div>
      </div>
      <div className="flex gap-2.5 mt-3.5">
        <button onClick={onDismiss} className="flex-1 py-2 rounded-xl border border-[rgba(160,120,255,0.22)] bg-transparent text-[#8880aa] text-sm font-semibold hover:border-[rgba(160,120,255,0.45)] hover:text-[#e8e0ff] transition-all">Cancel</button>
        <button onClick={onLogin}   className="flex-1 py-2 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white text-sm font-bold hover:from-purple-700 hover:to-purple-600 transition-all">Sign In →</button>
      </div>
    </div>
  </div>
);

// ── Size Required Toast ───────────────────────────────────────────────────────
const SizeToast = ({ visible, onDismiss }) => (
  <div className={`fixed inset-0 z-[60] flex items-end justify-center pb-10 px-4 pointer-events-none transition-all duration-300 ${visible ? "opacity-100" : "opacity-0"}`}>
    <div className={`pointer-events-auto w-full max-w-sm bg-[#1a1730] border border-[rgba(255,120,80,0.45)] rounded-2xl px-5 py-4 shadow-[0_0_40px_rgba(255,120,80,0.2)] transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-8"}`}>
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[rgba(255,120,80,0.15)] flex items-center justify-center shrink-0 text-lg">📏</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#ffe0d8] mb-0.5">Please select a size</div>
          <div className="text-xs text-[#aa8880] leading-relaxed">Choose an available size before adding to cart or buying.</div>
        </div>
      </div>
      <div className="flex gap-2.5 mt-3.5">
        <button onClick={onDismiss} className="flex-1 py-2 rounded-xl bg-gradient-to-br from-orange-600 to-red-500 text-white text-sm font-bold hover:from-orange-700 hover:to-red-600 transition-all">Got it</button>
      </div>
    </div>
  </div>
);

// ── CTA Buttons ───────────────────────────────────────────────────────────────
const CTAButtons = ({ compact = false, onCart, onBuy, sizeError }) => (
  <div className="flex flex-col gap-2 w-full">
    {sizeError && (
      <div
        className="text-xs text-orange-400 bg-orange-400/10 border border-orange-400/25 rounded-xl px-3 py-2 text-center font-semibold"
        style={{ animation: "size-shake 0.35s ease" }}
      >
        📏 Please select a size first
      </div>
    )}
    <div className="flex gap-3 w-full">
      <button
        onClick={onCart}
        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#8B5CF6] bg-[#111827]/95 backdrop-blur-md text-[#C4B5FD] font-semibold tracking-wide shadow-[0_0_18px_rgba(139,92,246,0.18)] hover:bg-[#1E1B4B] hover:shadow-[0_0_26px_rgba(139,92,246,0.35)] hover:border-[#A78BFA] transition-all duration-300 ${compact ? "py-2 text-sm" : "py-3.5 text-md"}`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        🛒 Add to Cart
      </button>
      <button
        onClick={onBuy}
        className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-none bg-gradient-to-br from-[#FFE51F] to-[#FFD600] text-[#111827] font-bold tracking-normal shadow-[0_0_20px_rgba(255,229,31,0.35)] hover:shadow-[0_0_30px_rgba(255,229,31,0.55)] hover:-translate-y-[1px] transition-all duration-300 ${compact ? "py-2 text-sm" : "py-3.5 text-md"}`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <IoIosFlash size={20} />
        Buy Now
      </button>
    </div>
  </div>
);

// ── Image Lightbox ────────────────────────────────────────────────────────────
const ImageLightbox = ({ images, productName, startIdx, imageUrl, onClose }) => {
  const [idx, setIdx]           = useState(startIdx);
  const [visible, setVisible]   = useState(false);
  const [sliding, setSliding]   = useState(false);
  const [slideDir, setSlideDir] = useState(0);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const goTo = useCallback((dir) => {
    if (sliding) return;
    setSlideDir(dir);
    setSliding(true);
    setTimeout(() => {
      setIdx(i => (i + dir + images.length) % images.length);
      setSlideDir(0);
      setSliding(false);
    }, 230);
  }, [sliding, images.length]);

  const prev = useCallback(() => goTo(-1), [goTo]);
  const next = useCallback(() => goTo(+1), [goTo]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, onClose]);

  const cardStyle = {
    transition: "opacity 0.23s ease, transform 0.23s cubic-bezier(.4,0,.2,1)",
    opacity:    sliding ? 0 : 1,
    transform:  sliding ? `translateX(${slideDir < 0 ? "60px" : "-60px"})` : "translateX(0)",
  };

  return (
    <div className="fixed inset-0 z-[200]" style={{ background: "#000", transition: "opacity 0.2s ease", opacity: visible ? 1 : 0 }}>
      <button onClick={onClose} className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-[rgba(40,40,40,0.95)] flex items-center justify-center text-white hover:bg-[rgba(80,80,80,0.95)] transition-all" style={{ fontSize: 22 }}>✕</button>
      {images.length > 1 && (
        <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[rgba(40,40,40,0.9)] flex items-center justify-center text-white hover:bg-[rgba(80,80,80,0.95)] transition-all text-2xl">‹</button>
      )}
      {images.length > 1 && (
        <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[rgba(40,40,40,0.9)] flex items-center justify-center text-white hover:bg-[rgba(80,80,80,0.95)] transition-all text-2xl">›</button>
      )}
      <div className="absolute inset-0 flex items-center justify-center" onClick={onClose}>
        <div onClick={e => e.stopPropagation()} style={{ ...cardStyle, position: "relative", width: "min(420px, 88vw)", borderRadius: 22, overflow: "hidden", background: "#fff", boxShadow: "0 30px 90px rgba(0,0,0,0.85)" }}>
          {imageUrl(images[idx]) ? (
            <img src={imageUrl(images[idx])} alt={`${productName} — image ${idx + 1}`} draggable={false} style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: "95vh", minHeight: "95vh" }} />
          ) : (
            <div style={{ height: 400, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>No Image</div>
          )}
          <div style={{ position: "absolute", inset: 0, top: "55%", background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.72) 100%)", borderRadius: "0 0 22px 22px", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 18px 14px", zIndex: 2 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 8, fontFamily: "'Poppins', sans-serif", textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>{productName}</div>
            {images.length > 1 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
                {images.map((_, i) => (
                  <button key={i} onClick={() => { if (!sliding) setIdx(i); }} style={{ width: i === idx ? 22 : 8, height: 8, borderRadius: 4, background: i === idx ? "#7c5cfc" : "rgba(255,255,255,0.45)", border: "none", padding: 0, cursor: "pointer", transition: "width 0.25s ease, background 0.2s ease" }} />
                ))}
              </div>
            )}
            <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "'Raleway', sans-serif" }}>Press ESC or click outside to close</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Expand Icon Button ────────────────────────────────────────────────────────
const ExpandButton = ({ onClick }) => (
  <button onClick={onClick} title="View full image" style={{ position: "absolute", top: 10, right: 10, zIndex: 20, width: 32, height: 32, borderRadius: 8, background: "rgba(14,19,32,0.82)", border: "1px solid rgba(160,120,255,0.4)", color: "#a078ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", backdropFilter: "blur(6px)", transition: "all 0.18s" }}
    onMouseEnter={e => { e.currentTarget.style.background = "rgba(160,120,255,0.22)"; e.currentTarget.style.borderColor = "#a078ff"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "rgba(14,19,32,0.82)"; e.currentTarget.style.borderColor = "rgba(160,120,255,0.4)"; }}
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  </button>
);

// ── helpers ───────────────────────────────────────────────────────────────────

/** Returns true if the product has a sizeStock map with at least one size */
const hasSizes = (product) =>
  product?.sizeStock && Object.keys(product.sizeStock).length > 0;

/** Returns true if at least one size has stock > 0 */
const hasAnySizeInStock = (product) =>
  hasSizes(product) && SIZES.some((s) => (product.sizeStock[s] ?? 0) > 0);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProductView() {
  const navigate      = useNavigate();
  const { productId } = useParams();

  const [product,   setProduct]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [imgIdx,    setImgIdx]    = useState(0);
  const [selSize,   setSelSize]   = useState(null);
  const [selColor,  setSelColor]  = useState(null);
  const [fixedBar,  setFixedBar]  = useState(false);
  const [authToast, setAuthToast] = useState(false);
  const [sizeToast, setSizeToast] = useState(false);   // ← new
  const [sizeError, setSizeError] = useState(false);   // ← inline error flag
  const [lightbox,  setLightbox]  = useState(false);

  const productDetailsRef = useRef(null);

  // ── Fetch product ──
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const decodedId  = decodeURIComponent(productId);
        const bytes      = CryptoJS.AES.decrypt(decodedId, SECRET_KEY);
        const originalId = bytes.toString(CryptoJS.enc.Utf8);
        const res        = await API.get(`/productBuy/fetchProductById/${originalId}`);
        if (res.data.success) {
          setProduct(res.data.data);
          if (res.data.data.color?.name) setSelColor(res.data.data.color.name);
        }
      } catch (err) {
        console.error(err.response?.data?.message || "Failed to fetch product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // ── Scroll watcher ──
  useEffect(() => {
    const handleScroll = () => {
      if (!productDetailsRef.current) return;
      const rect = productDetailsRef.current.getBoundingClientRect();
      setFixedBar(rect.top >= window.innerHeight);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Clear inline size error once user picks a size ──
  useEffect(() => {
    if (selSize) setSizeError(false);
  }, [selSize]);

  // ──────────────────────────────────────────────────────────────────────────
  // Size validation + session storage persistence
  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Validates size selection when needed.
   * - If the product has sizes AND at least one is in stock → user MUST pick one.
   * - If no sizes / all out of stock → no size needed; proceed freely.
   * Returns true if validation passes (OK to proceed), false otherwise.
   */
  const validateSize = () => {
    if (!product) return false;
    if (hasSizes(product) && hasAnySizeInStock(product) && !selSize) {
      // Show inline error + toast
      setSizeError(true);
      setSizeToast(true);
      // Scroll size selector into view
      document.getElementById("size-selector")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  /**
   * Saves the chosen size (or null) to sessionStorage so the checkout page
   * can read it via: sessionStorage.getItem("selectedSize")
   */
  const persistSize = () => {
    if (selSize) {
      sessionStorage.setItem("selectedSize", selSize);
    } else {
      sessionStorage.removeItem("selectedSize");
    }
  };

  // ── Auth + action guards ──
  const isLoggedIn = () => !!Cookies.get("user");

  const handleProtectedAction = (dest) => {
    if (!validateSize()) return;          // ← size check first
    persistSize();                        // ← save to sessionStorage
    if (isLoggedIn()) navigate(dest);
    else setAuthToast(true);
  };

  const handleCart = () => handleProtectedAction("/product-checkout");
  const handleBuy  = () =>
    handleProtectedAction(`/view-checkout/${encodeURIComponent(productId)}`);

  const handleGoToLogin = () => { setAuthToast(false); navigate("/login"); };

  const imageUrl = (path) =>
    path ? (path.startsWith("/") ? `${BASE_URL}${path}` : path) : null;

  const images      = product?.images || [];
  const prev        = () => setImgIdx(i => (i - 1 + images.length) % images.length);
  const next        = () => setImgIdx(i => (i + 1) % images.length);
  const hasDiscount = product
    ? product.discount > 0 && product.finalPrice && product.finalPrice !== product.price
    : false;

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
        @keyframes size-shake{
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
        .size-btn-error{
          animation: size-shake 0.35s ease;
          border-color: rgba(255,120,80,0.7) !important;
          box-shadow: 0 0 12px rgba(255,120,80,0.25) !important;
        }
      `}</style>

      <AuthToast visible={authToast} onLogin={handleGoToLogin} onDismiss={() => setAuthToast(false)} />
      <SizeToast visible={sizeToast} onDismiss={() => setSizeToast(false)} />

      {/* Lightbox */}
      {lightbox && product && images.length > 0 && (
        <ImageLightbox images={images} productName={product.name} startIdx={imgIdx} imageUrl={imageUrl} onClose={() => setLightbox(false)} />
      )}

      <div className="min-h-screen bg-[#0E1320] text-[#e8e0ff]" style={{ fontFamily: "'Raleway',sans-serif" }}>

        {loading && <ProductViewSkeleton />}

        {!loading && !product && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4" style={{ color: "rgba(255,255,255,0.3)" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm">Product not found.</p>
            <button onClick={() => navigate(-1)} className="text-xs text-purple-400 hover:text-purple-300 underline">Go back</button>
          </div>
        )}

        {!loading && product && (
          <div className="max-w-6xl mx-auto px-5 py-8">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

              {/* LEFT — Images */}
              <div className="flex flex-col gap-4">
                <div className="relative bg-[#12121a] border border-[rgba(160,120,255,0.15)] rounded-2xl overflow-hidden aspect-[4/5] mx-auto lg:w-[70%] w-[100%] flex items-center justify-center shadow-[0_0_40px_rgba(160,120,255,0.07)]">
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_30%_20%,rgba(160,120,255,0.07)_0%,transparent_60%)]" />
                  <ExpandButton onClick={() => setLightbox(true)} />
                  {imageUrl(images[imgIdx]) ? (
                    <img src={imageUrl(images[imgIdx])} alt={product.name} className="w-full h-full drop-shadow-[0_8px_32px_rgba(160,120,255,0.22)] cursor-pointer" onClick={() => setLightbox(true)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#8880aa] text-sm">No Image</div>
                  )}
                  {images.length > 1 && (
                    <>
                      <button onClick={prev} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[rgba(14,19,32,0.78)] backdrop-blur border border-[rgba(160,120,255,0.3)] text-[#a078ff] text-xl flex items-center justify-center z-10 hover:bg-[rgba(160,120,255,0.22)] transition-all">‹</button>
                      <button onClick={next} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[rgba(14,19,32,0.78)] backdrop-blur border border-[rgba(160,120,255,0.3)] text-[#a078ff] text-xl flex items-center justify-center z-10 hover:bg-[rgba(160,120,255,0.22)] transition-all">›</button>
                    </>
                  )}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-[#a078ff] scale-125" : "bg-[rgba(160,120,255,0.3)]"}`} />
                    ))}
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 mx-auto">
                    {images.map((src, i) => (
                      <button key={i} onClick={() => setImgIdx(i)} className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === imgIdx ? "border-[#a078ff] shadow-[0_0_10px_rgba(160,120,255,0.4)]" : "border-[rgba(160,120,255,0.15)] opacity-60 hover:opacity-100"}`}>
                        <img src={imageUrl(src)} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT — Details */}
              <div className="lg:sticky lg:top-5 flex flex-col gap-5">

                <div className="cinzel text-xl font-bold leading-snug text-[#e8e0ff]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {product.name}
                </div>

                {/* ── Size Selector ── */}
                {hasSizes(product) && (
                  <div id="size-selector">
                    <div className={`text-[11px] tracking-[0.14em] uppercase mb-2.5 flex items-center gap-2 ${sizeError ? "text-orange-400" : "text-[#8880aa]"}`}>
                      Select Size
                      {sizeError && (
                        <span className="text-[10px] text-orange-400 font-bold normal-case tracking-normal bg-orange-400/10 px-2 py-0.5 rounded-full">
                          ← required
                        </span>
                      )}
                    </div>
                    <div className={`flex flex-wrap gap-2 ${sizeError ? "size-btn-error" : ""}`} style={{ animation: sizeError ? "size-shake 0.35s ease" : "none" }}>
                      {SIZES.map((s) => {
                        const qty        = product.sizeStock[s] ?? 0;
                        const outOfStock = qty === 0;
                        const isSelected = selSize === s;
                        const isError    = sizeError && !outOfStock && !isSelected;
                        return (
                          <button
                            key={s}
                            onClick={() => !outOfStock && setSelSize(s)}
                            disabled={outOfStock}
                            className={`w-10 h-10 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center relative
                              ${outOfStock
                                ? "border-[rgba(160,120,255,0.08)] bg-[#0E1320] text-[#3a3456] cursor-not-allowed"
                                : isSelected
                                  ? "border-[#a078ff] bg-[rgba(160,120,255,0.13)] text-[#a078ff] shadow-[0_0_10px_rgba(160,120,255,0.22)]"
                                  : isError
                                    ? "border-orange-400/50 bg-[#0E1320] text-orange-300 hover:border-[#a078ff] hover:text-[#a078ff]"
                                    : "border-[rgba(160,120,255,0.22)] bg-[#0E1320] text-[#e8e0ff] hover:border-[#a078ff] hover:text-[#a078ff]"
                              }`}
                          >
                            {s}
                            {outOfStock && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="absolute w-full h-px bg-[#3a3456] rotate-45" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {/* Live selected size badge */}
                    {selSize && (
                      <div className="mt-2 text-xs text-[#a078ff] font-semibold">
                        Selected: <span className="bg-[rgba(160,120,255,0.13)] px-2 py-0.5 rounded-full">{selSize}</span>
                      </div>
                    )}
                  </div>
                )}

                {product.color && (
                  <>
                    <div className="text-[11px] tracking-[0.14em] uppercase text-[#8880aa]">Color</div>
                    <div className="flex items-center gap-2.5">
                      <button
                        title={product.color.name}
                        onClick={() => setSelColor(product.color.name)}
                        style={{ background: product.color.hex }}
                        className={`w-8 h-8 rounded-full border-2 border-transparent transition-all hover:scale-110 ${selColor === product.color.name ? "outline outline-2 outline-[#a078ff] outline-offset-2" : ""}`}
                      />
                      {selColor && <span className="text-xs text-[#8880aa]">{selColor}</span>}
                    </div>
                  </>
                )}

                <div className="h-px bg-[rgba(160,120,255,0.13)]" />

                <div className="flex items-baseline gap-3 flex-wrap">
                  <div className="cinzel text-3xl font-bold text-[#17ec03]">
                    ₹{hasDiscount ? product.finalPrice : product.price}
                  </div>
                  {hasDiscount && (
                    <>
                      <div className="text-base text-[#8880aa] line-through">₹{product.price}</div>
                      <div className="text-xs font-bold text-green-400 bg-green-400/10 px-2.5 py-0.5 rounded-full">
                        {product.discount}% OFF
                      </div>
                    </>
                  )}
                </div>

                <div className="h-px bg-[rgba(160,120,255,0.13)]" />

                <div>
                  <div className="text-[11px] tracking-[0.14em] uppercase text-[#8880aa] mb-2.5">Delivery Details</div>
                  <div className="bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-xl px-4 py-3.5 flex flex-col gap-3">
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="text-lg"><HiHomeModern size={20} /></span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#8880aa] text-xs">Delivering to</div>
                        <div className="text-[#e8e0ff] font-medium">Udaynarayanpur, West Bengal 711226</div>
                      </div>
                    </div>
                    <div className="h-px bg-[rgba(160,120,255,0.09)]" />
                    <div className="flex items-center gap-2.5 text-sm">
                      <span className="text-lg"><MdDeliveryDining size={25} /></span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#8880aa] text-xs">Estimated Delivery</div>
                        <div className="text-[#e8e0ff] font-medium">
                          <span className="text-green-400 font-semibold">{product.delivery}</span>
                          {" "}— Free
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

            {/* Product Details */}
            {product.details && product.details.length > 0 && (
              <div className="mt-10">
                <div className="text-[11px] tracking-[0.14em] uppercase text-[#8880aa] mb-2.5">Product Details</div>
                <div className="grid grid-cols-2 gap-2">
                  {product.details.map((d, i) => (
                    <div key={i} className="bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-lg px-3 py-2.5">
                      <div className="text-[10px] text-[#8880aa] uppercase tracking-widest mb-1">{d.field}</div>
                      <div className="text-sm text-[#e8e0ff] font-medium">{d.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="mt-14 pb-8">
              <div className="cinzel text-lg font-bold text-[#e8e0ff] mb-1.5">Customer Reviews</div>
              <div className="text-sm text-[#8880aa] mb-6">Verified purchases from Midnight Aura shoppers</div>

              <div className="flex items-center gap-8 bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-2xl px-6 py-5 mb-6 flex-wrap">
                <div className="text-center">
                  <div className="cinzel text-5xl font-bold text-yellow-400 leading-none">4.3</div>
                  <div className="text-yellow-400 text-xl my-1">★★★★☆</div>
                  <div className="text-xs text-[#8880aa]">2,841 ratings</div>
                </div>
                <div className="flex-1 flex flex-col gap-1.5 min-w-44">
                  {RATING_BARS.map((b, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-[#8880aa]">
                      <span className="min-w-7">{b.label}</span>
                      <div className="flex-1 h-1.5 bg-[#1a1a26] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-[#a078ff]" style={{ width: `${b.pct}%` }} />
                      </div>
                      <span>{b.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {REVIEWS.map((r, i) => (
                <div key={i} className="bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-2xl px-5 py-5 mb-4 hover:border-[rgba(160,120,255,0.38)] transition-colors">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0" style={{ background: r.avatarGrad }}>{r.initial}</div>
                    <div>
                      <div className="text-sm font-semibold text-[#e8e0ff]">{r.name}</div>
                      <div className="text-[11px] text-[#8880aa] mt-0.5">{r.date}</div>
                    </div>
                    <div className="ml-auto text-sm"><Stars n={r.stars} /></div>
                  </div>
                  <div className="text-sm font-semibold text-[#a078ff] mb-1.5">{r.title}</div>
                  <div className="text-sm text-[#b0a8cc] leading-relaxed">{r.body}</div>
                  {r.verified && (
                    <div className="inline-flex items-center gap-1 text-[11px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded mt-2.5">✔ Verified Purchase</div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Fixed bottom bar */}
        <div className={`fixed md:hidden bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${fixedBar ? "translate-y-0" : "translate-y-full"}`}>
          <div className="px-1 py-3">
            <div className="max-w-6xl mx-auto">
              <CTAButtons onCart={handleCart} onBuy={handleBuy} sizeError={sizeError} />
            </div>
          </div>
        </div>

      </div>
    </>
  );
}