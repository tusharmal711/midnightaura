import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiHeart, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import Cookies from "js-cookie";
import appLogo from "../assets/images/appImage/medo-logo.png";
import { API } from "../api";
import { useRef } from "react";
// ── Helpers (same pattern as Cart.jsx) ───────────────────────────────────────
const getStoredEmail = () => {
  try { const s = localStorage.getItem("user"); if (s) { const p = JSON.parse(s); if (p?.email) return p.email; } } catch (_) {}
  try { const c = Cookies.get("user"); if (c) { const p = JSON.parse(c); if (p?.email) return p.email; } } catch (_) {}
  return null;
};

export default function UserNavbar() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen]   = useState(false);
  const navigate = useNavigate();
const intervalRef = useRef(null);
  // Fetch live cart count from DB on mount
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
      const count =
        cartRes.data.summary?.totalItems ??
        cartRes.data.data?.length ??
        0;

      setCartCount(count);
    }
  } catch (err) {
    console.error(err);
  }
};
useEffect(() => {
  fetchCartCount();

  intervalRef.current = setInterval(() => {
    fetchCartCount();
  }, 2000); // every 2 sec

  return () => {
    clearInterval(intervalRef.current);
  };
}, []);
  return (
    <div className="sticky top-0 z-50 bg-[#0B0F1A] border-b border-white/10">

      {/* ── Main bar ── */}
      <div className="flex items-center px-4 md:px-6 py-3 max-w-screen-xl mx-auto gap-3">

        {/* Logo + Brand */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => navigate("/user/dashboard")}
        >
          <img src={appLogo} alt="app-logo" className="h-9 w-auto" />
          <span
  style={{
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 900,
    background:
      "linear-gradient(90deg,#ff0000 0%,#ff5e00 40%,#ff9d00 70%,#ffd000 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.04em",
  }}
  className="text-[18px] md:text-[24px] lowercase"
>
  medocart
</span>
        </div>

        {/* Search — desktop only */}
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
        <div className="flex items-center gap-3 ml-auto">

          {/* My Profile — always visible */}
          <button
            onClick={() => navigate("/user/profile")}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:shadow-pink-500/40 transition whitespace-nowrap"
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
            className="md:hidden text-white leading-none"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pb-4 flex flex-col gap-3">

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 rounded-xl outline-none text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 transition-colors"
              placeholder="Search..."
            />
          </div>

          {/* Wishlist + Cart row */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/wishlist")}
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-pink-400 transition-colors"
            >
              <FiHeart className="w-5 h-5 shrink-0" />
              Wishlist
            </button>

            <button
              onClick={() => navigate("/user/profile/cart")}
              className="relative flex items-center gap-1.5 text-sm text-white/80 hover:text-purple-400 transition"
            >
              <FiShoppingCart className="w-5 h-5 shrink-0" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-purple-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}