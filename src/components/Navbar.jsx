import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiMenu, FiX, FiSearch } from "react-icons/fi";
import appLogo from "../assets/images/appImage/chomoktomok-logo.png";

// ── Categories list ────────────────────────────────────────────────────────────
const categories = [
  { label: "For You",           path: "/user/dashboard" },
  { label: "Men",               path: "/user/dashboard/categories/men" },
  { label: "Women",             path: "/user/dashboard/categories/women" },
  { label: "Kids",              path: "/user/dashboard/categories/kids" },
  { label: "Earrings",          path: "/user/dashboard/categories/earrings" },
  { label: "Necklaces",         path: "/user/dashboard/categories/necklaces" },
  { label: "Oversized",         path: "/user/dashboard/categories/oversized" },
  { label: "Hoodies",           path: "/user/dashboard/categories/hoodies" },
  { label: "Customize T-shirt", path: "/user/dashboard/categories/customize", special: true },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCartModal, setShowCartModal]         = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  const tooltipTimer   = useRef(null);
  const searchInputRef = useRef(null);
  const navigate       = useNavigate();
  const location       = useLocation();

  const isHome = location.pathname === "/";

  // ── Tooltip on home ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHome) { setShowTooltip(false); return; }
    const delay = setTimeout(() => {
      setShowTooltip(true);
      tooltipTimer.current = setTimeout(() => setShowTooltip(false), 8000);
    }, 800);
    return () => { clearTimeout(delay); clearTimeout(tooltipTimer.current); };
  }, [isHome]);

  const dismissTooltip = () => {
    setShowTooltip(false);
    clearTimeout(tooltipTimer.current);
  };

  // ── Focus search input on open ───────────────────────────────────────────────
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // ── Close search on outside click ───────────────────────────────────────────
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (!e.target.closest("[data-search-zone]")) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // ── Shared login-required modal ──────────────────────────────────────────────
  const LoginModal = ({ icon: Icon, itemLabel, onClose }) => (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        style={{
          width: "420px", maxWidth: "90%",
          background: "linear-gradient(180deg,#111827 0%,#0b1020 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "22px", padding: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,.5)",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 34, height: 34, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.1)",
            background: "rgba(255,255,255,.04)",
            color: "#fff", cursor: "pointer", fontSize: "18px",
          }}
        >✕</button>

        {/* Icon circle */}
        <div style={{
          width: 70, height: 70, borderRadius: "50%",
          margin: "0 auto 18px", display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg,#7c3aed,#ec4899)",
        }}>
          <Icon size={30} color="#fff" />
        </div>

        <h2 style={{ color: "#fff", textAlign: "center", fontSize: "24px", fontWeight: 700, marginBottom: "10px" }}>
          Login Required
        </h2>
        <p style={{ color: "rgba(255,255,255,.7)", textAlign: "center", lineHeight: 1.6, marginBottom: "24px" }}>
          Please login to access your {itemLabel} and continue shopping.
        </p>

        <button
          onClick={() => { onClose(); navigate("/login"); }}
          style={{
            width: "100%", padding: "14px", border: "none",
            borderRadius: "14px", cursor: "pointer",
            color: "#fff", fontWeight: 700, fontSize: "15px",
            background: "linear-gradient(90deg,#7c3aed,#ec4899)",
          }}
        >
          Login Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="sticky top-0 z-50 bg-[#0B0F1A] border-b border-white/10">

      {/* ── Modals ── */}
      {showCartModal    && <LoginModal icon={FiShoppingCart} itemLabel="cart items"     onClose={() => setShowCartModal(false)} />}
      {showWishlistModal && <LoginModal icon={FiHeart}        itemLabel="wishlist items" onClose={() => setShowWishlistModal(false)} />}

      {/* ── Main bar ── */}
      <div className="flex items-center px-4 md:px-6 py-3 max-w-screen-xl mx-auto gap-3">

        {/* Logo + Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => navigate("/")}
        >
          {/* h-8 on mobile, h-10 on md+ */}
          <img src={appLogo} alt="app-logo" className="h-10 md:h-10 w-auto" />
        
        </div>

        {/* Search — desktop */}
        <div className="hidden md:flex flex-1 mx-4 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 rounded-xl outline-none text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 transition-colors"
            placeholder="Search for T-shirts, Hoodies..."
          />
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto" data-search-zone>

          {/* Expanding search — mobile only */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              searchOpen ? "w-44 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <input
              ref={searchInputRef}
              className="w-full bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl outline-none text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 transition-colors"
              placeholder="Search..."
            />
          </div>

          {/* Search icon — mobile only */}
          <button
            className="md:hidden flex items-center justify-center text-white/70 hover:text-white transition-colors shrink-0"
            aria-label="Toggle search"
            onClick={() => setSearchOpen((o) => !o)}
          >
            {searchOpen ? <FiX size={20} /> : <FiSearch size={20} />}
          </button>

          {/* Login button — always visible */}
          <div className="relative">
            <button
              onClick={() => { dismissTooltip(); navigate("/login"); }}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:shadow-pink-500/40 transition whitespace-nowrap shrink-0"
            >
              Login
            </button>

            {/* Shake tooltip — desktop only */}
            {showTooltip && (
              <div
                className="tooltip-shake absolute z-50 hidden md:block"
                style={{ top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
              >
                <div className="mx-auto" style={{
                  width: 0, height: 0,
                  borderLeft: "8px solid transparent",
                  borderRight: "8px solid transparent",
                  borderBottom: "8px solid white",
                }} />
                <div
                  onClick={() => { dismissTooltip(); navigate("/login"); }}
                  className="cursor-pointer bg-white text-[#3730a3] font-bold text-sm px-6 py-2.5 rounded-md shadow-2xl whitespace-nowrap hover:bg-purple-50 transition-colors select-none"
                >
                  Login
                </div>
              </div>
            )}
          </div>

          {/* Wishlist — desktop only */}
          <button
            onClick={() => setShowWishlistModal(true)}
            className="hidden md:flex items-center gap-1.5 text-sm text-white/80 hover:text-pink-400 transition-colors"
          >
            <FiHeart className="w-5 h-5 shrink-0" />
            Wishlist
          </button>

          {/* Cart — desktop only */}
          <button
            onClick={() => setShowCartModal(true)}
            className="hidden md:flex relative items-center gap-1.5 text-sm text-white/80 hover:text-purple-400 transition"
          >
            <FiShoppingCart className="w-5 h-5 shrink-0" />
            Cart
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden text-white leading-none shrink-0"
            aria-label="Toggle menu"
            onClick={() => { setMenuOpen((o) => !o); setSearchOpen(false); }}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10">

          {/* Wishlist + Cart row */}
          <div className="flex items-center gap-6 px-4 pt-3 pb-3">
            <button
              onClick={() => { setShowWishlistModal(true); setMenuOpen(false); }}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-pink-400 transition-colors"
            >
              <FiHeart className="w-5 h-5 shrink-0" />
              Wishlist
            </button>

            <button
              onClick={() => { setShowCartModal(true); setMenuOpen(false); }}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-purple-400 transition"
            >
              <FiShoppingCart className="w-5 h-5 shrink-0" />
              Cart
            </button>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-white/10" />

          {/* Categories — text only, no icons */}
          <div className="px-4 pt-3 pb-4 flex flex-col gap-1">
            {categories.map((cat, i) => {
              const isActive = location.pathname === cat.path;
              return (
                <button
                  key={i}
                  onClick={() => { navigate(cat.path); setMenuOpen(false); }}
                  className={`
                    text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${cat.special
                      ? "text-emerald-400 hover:bg-emerald-500/10"
                      : isActive
                        ? "text-white bg-purple-700/50"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shakePulse {
          0%   { transform: translateX(-50%); }
          4%   { transform: translateX(calc(-50% - 5px)); }
          8%   { transform: translateX(calc(-50% + 5px)); }
          12%  { transform: translateX(calc(-50% - 4px)); }
          16%  { transform: translateX(calc(-50% + 4px)); }
          20%  { transform: translateX(calc(-50% - 3px)); }
          24%  { transform: translateX(calc(-50% + 3px)); }
          28%  { transform: translateX(calc(-50% - 2px)); }
          32%  { transform: translateX(calc(-50% + 2px)); }
          36%  { transform: translateX(calc(-50% - 1px)); }
          40%  { transform: translateX(-50%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .tooltip-shake { animation: shakePulse 2.5s ease infinite; }
      `}</style>
    </div>
  );
}