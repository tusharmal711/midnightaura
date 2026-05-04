import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiHeart, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import appLogo from "../assets/images/appImage/app-logo.png";
export default function UserNavbar() {
  const [cartCount] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-[#0B0F1A] border-b border-white/10">

      {/* ── Main bar ── */}
      <div className="flex flex-wrap items-center gap-y-3 px-4 md:px-6 py-3 max-w-screen-xl mx-auto">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate("/user/dashboard")}>
          <img src={appLogo} alt="app-logo" className="h-9 md:h-10 w-auto" />
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-[10px] md:text-[11px] tracking-[0.3em] text-yellow-400/70 font-light">MIDNIGHT</span>
            <span className="text-[10px] md:text-[11px] tracking-[0.3em] text-yellow-400/70 font-light">— AURA —</span>
          </div>
        </div>

        {/* Search — desktop */}
        <div className="hidden md:flex flex-1 mx-6 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 rounded-xl outline-none text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 transition-colors"
            placeholder="Search for T-shirts, Hoodies..."
          />
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-5 ml-auto">
          <ActionButtons cartCount={cartCount} navigate={navigate} />
        </div>

        {/* Hamburger — mobile */}
        <button
          className="md:hidden ml-auto text-white text-xl leading-none"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"}`}>
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

          {/* Mobile stacked buttons */}
          <ActionButtons cartCount={cartCount} navigate={navigate} stack />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   ActionButtons — Profile / Wishlist / Cart
   stack prop → flex-col on mobile, flex-row on desktop
───────────────────────────────────────────────────── */
function ActionButtons({ cartCount, navigate, stack = false }) {
  return (
    <div className={`flex ${stack ? "flex-col w-full items-start" : "flex-row items-center"} gap-3`}>

      {/* My Profile */}
      <button
        onClick={() => navigate("/user/profile")}
        className={`flex items-center gap-2 px-4 py-1.5 text-sm text-white rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:shadow-pink-500/40 transition ${stack ? "w-full justify-center" : ""}`}
      >
        <FiUser className="w-4 h-4 shrink-0" />
        My Profile
      </button>

      {/* Wishlist */}
      <button
        onClick={() => navigate("/wishlist")}
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-pink-400 transition-colors"
      >
        <FiHeart className="w-5 h-5 shrink-0" />
        Wishlist
      </button>

      {/* Cart */}
      <button
        onClick={() => navigate("/user/profile/cart")}
        className="relative flex items-center gap-1.5 text-sm text-white/80 hover:text-purple-400 transition"
      >
        <FiShoppingCart className="w-5 h-5 shrink-0" />
        Cart
        <span className="absolute -top-2 -right-3 bg-purple-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          {cartCount}
        </span>
      </button>
    </div>
  );
}