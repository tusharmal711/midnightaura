import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiUser, FiHeart, FiShoppingCart, FiMenu, FiX, FiSearch } from "react-icons/fi";
import Cookies from "js-cookie";
import appLogo from "../assets/images/appImage/chomoktomok-logo.png";
import { API } from "../api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStoredEmail = () => {
  try { const s = localStorage.getItem("user"); if (s) { const p = JSON.parse(s); if (p?.email) return p.email; } } catch (_) {}
  try { const c = Cookies.get("user"); if (c) { const p = JSON.parse(c); if (p?.email) return p.email; } } catch (_) {}
  return null;
};

// ── Categories list (mirrors CategoryLayout) ─────────────────────────────────
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

export default function UserNavbar() {
  const [cartCount, setCartCount]   = useState(0);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate                    = useNavigate();
  const location                    = useLocation();
  const intervalRef                 = useRef(null);
  const searchInputRef              = useRef(null);

  // ── Cart count ──────────────────────────────────────────────────────────────
  const fetchCartCount = async () => {
    try {
      const email = getStoredEmail();
      if (!email) return;
      const profileRes = await API.post("/user/getProfile", { email });
      if (!profileRes.data.success) return;
      const customerId = profileRes.data.user?.customerId;
      if (!customerId) return;
      const cartRes = await API.get(`/cart/getCart/${customerId}`);
      if (cartRes.data.success) {
        const count = cartRes.data.summary?.totalItems ?? cartRes.data.data?.length ?? 0;
        setCartCount(count);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCartCount();
    intervalRef.current = setInterval(fetchCartCount, 2000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // Focus input when search expands
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close search on outside click
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e) => {
      if (!e.target.closest("[data-search-zone]")) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  return (
    <div className="sticky top-0 z-50 bg-[#0B0F1A] border-b border-white/10">

      {/* ── Main bar ── */}
      <div className="flex items-center px-4 md:px-6 py-3 max-w-screen-xl mx-auto gap-3">

        {/* Logo + Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => navigate("/")}
        >
          {/* Smaller logo on mobile (h-8), normal on md+ (h-10) */}
          <img src={appLogo} alt="app-logo" className="h-10 md:h-10 w-auto" />
          <span
            className="hidden sm:block text-[24px] sm:text-[26px] md:text-[22px]"
            style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 900,
              background: "linear-gradient(90deg,#ff0000 0%,#ff5e00 40%,#ff9d00 70%,#ffd000 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.06em",
              lineHeight: "1",
            }}
          >
            চমক টমক
          </span>
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

          {/* Expanding search input — mobile only */}
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

          {/* My Profile */}
          <button
            onClick={() => navigate("/user/profile")}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:shadow-pink-500/40 transition whitespace-nowrap shrink-0"
          >
            <FiUser className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">My Profile</span>
          </button>

          {/* Wishlist — desktop only */}
          <button
            onClick={() => navigate("/wishlist")}
            className="hidden md:flex items-center gap-1.5 text-sm text-white/80 hover:text-pink-400 transition-colors"
          >
            <FiHeart className="w-5 h-5 shrink-0" />
            Wishlist
          </button>

          {/* Cart — desktop only */}
          <button
            onClick={() => navigate("/user/profile/cart")}
            className="hidden md:flex relative items-center gap-1.5 text-sm text-white/80 hover:text-purple-400 transition"
          >
            <FiShoppingCart className="w-5 h-5 shrink-0" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-purple-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
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
              onClick={() => { navigate("/wishlist"); setMenuOpen(false); }}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-pink-400 transition-colors"
            >
              <FiHeart className="w-5 h-5 shrink-0" />
              Wishlist
            </button>

            <button
              onClick={() => { navigate("/user/profile/cart"); setMenuOpen(false); }}
              className="flex items-center gap-2 text-sm text-white/80 hover:text-purple-400 transition relative"
            >
              <FiShoppingCart className="w-5 h-5 shrink-0" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 left-3 bg-purple-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
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
    </div>
  );
}