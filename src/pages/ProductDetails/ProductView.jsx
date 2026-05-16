import { useState, useEffect, useRef } from "react";
import { IoIosFlash } from "react-icons/io";
import { MdDeliveryDining } from "react-icons/md";
import { HiHomeModern } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import tshirt8 from "../../assets/images/products/tshirt8.png";
import tshirt9 from "../../assets/images/products/tshirt9.png";
import tshirt10 from "../../assets/images/products/tshirt10.png";

// ── Data ──────────────────────────────────────────────────────────────────────
const PRODUCT = {
  brand: "Canon",
  name: "PIXMA G3470 All-in-One Wi-Fi Ink Tank Colour Printer",
  price: "₹8,299",
  oldPrice: "₹12,495",
  discount: "33% OFF",
  rating: 4.3,
  ratingCount: "2,841",
  reviewCount: "318",
  badge: "Best Seller",
  images: [tshirt9, tshirt8, tshirt10],
  delivery: {
    address: "Udaynarayanpur, West Bengal 711226",
    eta: "Tomorrow by 11 PM",
    seller: "BUZZINDIA",
    sellerTag: "4+ years",
  },
  details: [
    { key: "Type", val: "Ink Tank" },
    { key: "Function", val: "Print, Scan, Copy" },
    { key: "Connectivity", val: "Wi-Fi, USB" },
    { key: "Print Speed", val: "Up to 9.1 ipm" },
    { key: "Resolution", val: "4800 × 1200 dpi" },
    { key: "Ink Yield", val: "~6,000 (BW)" },
  ],
  warranty: "1 Year or 30,000 Prints (whichever is earlier) — Onsite Warranty",
};

const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS = [{ name: "Red", hex: "#e53e3e" }];

const RATING_BARS = [
  { label: "5 ★", pct: 58 },
  { label: "4 ★", pct: 22 },
  { label: "3 ★", pct: 10 },
  { label: "2 ★", pct: 5 },
  { label: "1 ★", pct: 5 },
];

const REVIEWS = [
  {
    name: "Anjali Sharma", initial: "A",
    avatarGrad: "linear-gradient(135deg,#a078ff,#ff6eb4)",
    date: "12 May 2025", stars: 5,
    title: "Absolutely worth every rupee!",
    body: "The print quality is stunning — colours come out vibrant and true to life. Set up was super easy via Wi-Fi and I was printing within minutes. The ink tank holds a LOT of ink, so running costs are extremely low compared to cartridge printers.",
    verified: true,
  },
  {
    name: "Rahul Das", initial: "R",
    avatarGrad: "linear-gradient(135deg,#4ade80,#06b6d4)",
    date: "3 Apr 2025", stars: 4,
    title: "Great for home office use",
    body: "Scanning and copying work flawlessly. The Wi-Fi connection is stable. Only minor gripe is that it can be a bit slow for large photo prints, but for documents it is very fast. Overall a great buy for the price point.",
    verified: true,
  },
  {
    name: "Priya Mukherjee", initial: "P",
    avatarGrad: "linear-gradient(135deg,#f0c060,#ff6eb4)",
    date: "19 Mar 2025", stars: 5,
    title: "Best printer I have ever owned",
    body: "Replaced my 5-year-old cartridge printer with this and the difference is night and day. The ink lasts so long — printed over 400 pages and barely used 10% of the tank. Build quality feels solid and premium. Highly recommend!",
    verified: true,
  },
];

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ n }) =>
  [1, 2, 3, 4, 5].map((s) => (
    <span key={s} className={s <= n ? "text-yellow-400" : "text-[#3a3456]"}>★</span>
  ));

// ── Auth Toast ────────────────────────────────────────────────────────────────
// A dedicated overlay toast for the "please login" flow
const AuthToast = ({ visible, onLogin, onDismiss }) => (
  <div
    className={`fixed inset-0 z-[60] flex items-end justify-center pb-10 px-4 pointer-events-none transition-all duration-300 ${
      visible ? "opacity-100" : "opacity-0"
    }`}
  >
    <div
      className={`pointer-events-auto w-full max-w-sm bg-[#1a1730] border border-[rgba(160,120,255,0.35)] rounded-2xl px-5 py-4 shadow-[0_0_40px_rgba(160,120,255,0.25)] transition-transform duration-300 ${
        visible ? "translate-y-0" : "translate-y-8"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[rgba(160,120,255,0.15)] flex items-center justify-center shrink-0 text-lg">
          🔐
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#e8e0ff] mb-0.5">Login required</div>
          <div className="text-xs text-[#8880aa] leading-relaxed">
            Please sign in to continue with your purchase.
          </div>
        </div>
      </div>
      <div className="flex gap-2.5 mt-3.5">
        <button
          onClick={onDismiss}
          className="flex-1 py-2 rounded-xl border border-[rgba(160,120,255,0.22)] bg-transparent text-[#8880aa] text-sm font-semibold hover:border-[rgba(160,120,255,0.45)] hover:text-[#e8e0ff] transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onLogin}
          className="flex-1 py-2 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white text-sm font-bold hover:from-purple-700 hover:to-purple-600 hover:shadow-[0_0_18px_rgba(124,58,237,0.4)] transition-all"
        >
          Sign In →
        </button>
      </div>
    </div>
  </div>
);

// ── Shared CTA buttons ────────────────────────────────────────────────────────
const CTAButtons = ({ compact = false, onCart, onBuy }) => (
  <div className="flex gap-3 w-full">
    {/* Add To Cart */}
    <button
      onClick={onCart}
      className={`
        flex-1 flex items-center justify-center gap-2
        rounded-xl border border-[#8B5CF6]
        bg-[#111827]/95 backdrop-blur-md
        text-[#C4B5FD]
        font-semibold tracking-wide
        shadow-[0_0_18px_rgba(139,92,246,0.18)]
        hover:bg-[#1E1B4B]
        hover:shadow-[0_0_26px_rgba(139,92,246,0.35)]
        hover:border-[#A78BFA]
        transition-all duration-300
        ${compact ? "py-2 text-sm" : "py-3.5 text-md"}
      `}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      🛒 Add to Cart
    </button>

    {/* Buy Now */}
    <button
      onClick={onBuy}
      className={`
        flex-1 flex items-center justify-center gap-2
        rounded-xl border-none
        bg-gradient-to-br from-[#FFE51F] to-[#FFD600]
        text-[#111827]
        font-bold tracking-normal
        shadow-[0_0_20px_rgba(255,229,31,0.35)]
        hover:shadow-[0_0_30px_rgba(255,229,31,0.55)]
        hover:-translate-y-[1px]
        transition-all duration-300
        ${compact ? "py-2 text-sm" : "py-3.5 text-md"}
      `}
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <IoIosFlash size={20} />
      Buy Now
    </button>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProductView() {
  const navigate = useNavigate();

  const [imgIdx, setImgIdx] = useState(0);
  const [selSize, setSelSize] = useState(null);
  const [selColor, setSelColor] = useState(null);
  const [fixedBar, setFixedBar] = useState(false);
  const [authToast, setAuthToast] = useState(false);

  const productDetailsRef = useRef(null);

  // ── Scroll watcher for fixed bottom bar ──
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

  // ── Auth-gated action handler ──
  const isLoggedIn = () => !!Cookies.get("user");

  const handleProtectedAction = (destination) => {
    if (isLoggedIn()) {
      navigate(destination);
    } else {
      setAuthToast(true);
    }
  };

  const handleCart = () => handleProtectedAction("/product-checkout");
  const handleBuy = () => handleProtectedAction("/product-checkout");

  const handleGoToLogin = () => {
    setAuthToast(false);
    navigate("/login");
  };

  const prev = () => setImgIdx((i) => (i - 1 + PRODUCT.images.length) % PRODUCT.images.length);
  const next = () => setImgIdx((i) => (i + 1) % PRODUCT.images.length);

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
      `}</style>

      {/* ── Auth Toast Overlay ── */}
      <AuthToast
        visible={authToast}
        onLogin={handleGoToLogin}
        onDismiss={() => setAuthToast(false)}
      />

      <div className="min-h-screen bg-[#0E1320] text-[#e8e0ff]" style={{ fontFamily: "'Raleway',sans-serif" }}>
        <div className="max-w-6xl mx-auto px-5 py-8">

          {/* ══ Two-col grid ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* LEFT */}
            <div className="flex flex-col gap-4">

              {/* Slider */}
              <div className="
                relative
                bg-[#12121a]
                border border-[rgba(160,120,255,0.15)]
                rounded-2xl
                overflow-hidden
                aspect-[4/5]
                mx-auto
                lg:w-[70%]
                w-[100%]
                flex items-center justify-center
                shadow-[0_0_40px_rgba(160,120,255,0.07)]
              ">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_30%_20%,rgba(160,120,255,0.07)_0%,transparent_60%)]" />
                <img
                  src={PRODUCT.images[imgIdx]}
                  alt={`Product ${imgIdx + 1}`}
                  className="w-[100%] object-contain drop-shadow-[0_8px_32px_rgba(160,120,255,0.22)]"
                />
                <button onClick={prev} className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[rgba(14,19,32,0.78)] backdrop-blur border border-[rgba(160,120,255,0.3)] text-[#a078ff] text-xl flex items-center justify-center z-10 hover:bg-[rgba(160,120,255,0.22)] transition-all">‹</button>
                <button onClick={next} className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[rgba(14,19,32,0.78)] backdrop-blur border border-[rgba(160,120,255,0.3)] text-[#a078ff] text-xl flex items-center justify-center z-10 hover:bg-[rgba(160,120,255,0.22)] transition-all">›</button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {PRODUCT.images.map((_, i) => (
                    <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-[#a078ff] scale-125" : "bg-[rgba(160,120,255,0.3)]"}`} />
                  ))}
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="flex gap-2 mx-auto">
                {PRODUCT.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${i === imgIdx ? "border-[#a078ff] shadow-[0_0_10px_rgba(160,120,255,0.4)]" : "border-[rgba(160,120,255,0.15)] opacity-60 hover:opacity-100"}`}
                  >
                    <img src={src} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

            </div>

            {/* RIGHT */}
            <div className="lg:sticky lg:top-5 flex flex-col gap-5">

              {/* Brand + Name */}
              <div>
                <div className="cinzel text-xl font-bold leading-snug text-[#e8e0ff] mt-1.5" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {PRODUCT.name}
                </div>
              </div>

              {/* Size */}
              <div className="text-[11px] tracking-[0.14em] uppercase text-[#8880aa]">Select Size</div>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelSize(s)}
                    className={`w-10 h-10 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center ${selSize === s ? "border-[#a078ff] bg-[rgba(160,120,255,0.13)] text-[#a078ff] shadow-[0_0_10px_rgba(160,120,255,0.22)]" : "border-[rgba(160,120,255,0.22)] bg-[#0E1320] text-[#e8e0ff] hover:border-[#a078ff] hover:text-[#a078ff]"}`}
                  >{s}</button>
                ))}
              </div>

              {/* Color */}
              <div className="text-[11px] tracking-[0.14em] uppercase text-[#8880aa]">Color</div>
              <div className="flex items-center gap-2.5">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => setSelColor(c.name)}
                    style={{ background: c.hex }}
                    className={`w-8 h-8 rounded-full border-2 border-transparent transition-all hover:scale-110 ${selColor === c.name ? "outline outline-2 outline-[#a078ff] outline-offset-2" : ""}`}
                  />
                ))}
                {selColor && <span className="text-xs text-[#8880aa]">{selColor}</span>}
              </div>

              <div className="h-px bg-[rgba(160,120,255,0.13)]" />

              {/* Price */}
              <div className="flex items-baseline gap-3 flex-wrap">
                <div className="cinzel text-3xl font-bold text-[#17ec03]">{PRODUCT.price}</div>
                <div className="text-base text-[#8880aa] line-through">{PRODUCT.oldPrice}</div>
                <div className="text-xs font-bold text-green-400 bg-green-400/10 px-2.5 py-0.5 rounded-full">{PRODUCT.discount}</div>
              </div>

              <div className="h-px bg-[rgba(160,120,255,0.13)]" />

              {/* Delivery */}
              <div>
                <div className="text-[11px] tracking-[0.14em] uppercase text-[#8880aa] mb-2.5">Delivery Details</div>
                <div className="bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-xl px-4 py-3.5 flex flex-col gap-3">
                  {[
                    { icon: <HiHomeModern size={20} />, label: "Delivering to", val: PRODUCT.delivery.address },
                    {
                      icon: <MdDeliveryDining size={25} />, label: "Estimated Delivery",
                      val: <><span className="text-green-400 font-semibold">{PRODUCT.delivery.eta}</span> — Free</>,
                    },
                  ].map((row, i) => (
                    <div key={i}>
                      {i > 0 && <div className="h-px bg-[rgba(160,120,255,0.09)] mb-3" />}
                      <div className="flex items-center gap-2.5 text-sm">
                        <span className="text-lg">{row.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[#8880aa] text-xs">{row.label}</div>
                          <div className="text-[#e8e0ff] font-medium">{row.val}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Inline CTA ── */}
              <div ref={productDetailsRef}>
                <CTAButtons compact onCart={handleCart} onBuy={handleBuy} />
              </div>

            </div>
          </div>

          {/* Product Details */}
          <div className="mt-10">
            <div className="text-[11px] tracking-[0.14em] uppercase text-[#8880aa] mb-2.5">Product Details</div>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCT.details.map((d, i) => (
                <div key={i} className="bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-lg px-3 py-2.5">
                  <div className="text-[10px] text-[#8880aa] uppercase tracking-widest mb-1">{d.key}</div>
                  <div className="text-sm text-[#e8e0ff] font-medium">{d.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ══ Reviews ══ */}
          <div className="mt-14 pb-8">
            <div className="cinzel text-lg font-bold text-[#e8e0ff] mb-1.5">Customer Reviews</div>
            <div className="text-sm text-[#8880aa] mb-6">Verified purchases from Midnight Aura shoppers</div>

            <div className="flex items-center gap-8 bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-2xl px-6 py-5 mb-6 flex-wrap">
              <div className="text-center">
                <div className="cinzel text-5xl font-bold text-yellow-400 leading-none">{PRODUCT.rating}</div>
                <div className="text-yellow-400 text-xl my-1">★★★★☆</div>
                <div className="text-xs text-[#8880aa]">{PRODUCT.ratingCount} ratings</div>
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

        {/* ══ Fixed bottom bar ══ */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
            fixedBar ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="px-1 py-3">
            <div className="max-w-6xl mx-auto">
              <CTAButtons onCart={handleCart} onBuy={handleBuy} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}