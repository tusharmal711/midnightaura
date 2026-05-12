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
      <div className="flex items-center px-4 md:px-6 py-3 max-w-screen-xl mx-auto gap-3">

        {/* Logo + Brand Text — always visible on all screen sizes */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => navigate("/user/dashboard")}
        >
          <img src={appLogo} alt="app-logo" className="h-9 w-auto" />
          <div className="flex flex-col leading-none">
            <span className="text-[9px] md:text-[11px] tracking-[0.28em] text-yellow-400 font-semibold">
              MIDNIGHT
            </span>
            <span className="text-[9px] md:text-[11px] tracking-[0.28em] text-yellow-400 font-semibold">
              — AURA —
            </span>
          </div>
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

        {/* Right side — My Profile always visible + desktop extras + hamburger */}
        <div className="flex items-center gap-3 ml-auto">

          {/* My Profile — always visible on all screen sizes */}
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
            <span className="absolute -top-2 -right-3 bg-purple-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
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

      {/* ── Mobile drawer — search + wishlist + cart ── */}
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
              <span className="absolute -top-2 -right-3 bg-purple-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}