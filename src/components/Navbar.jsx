import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import appLogo from "../assets/images/appImage/medo-logo.png";

import {FiShoppingCart} from "react-icons/fi";
export default function Navbar() {
  const [cartCount] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
const [showCartMessage, setShowCartMessage] = useState(false);
const [showWishListMessage, setShowWishListMessage] = useState(false);
const [showLoginCartModal, setShowLoginCartModal] = useState(false);
  const isHome = location.pathname === "/";

  useEffect(() => {
    if (isLoggedIn || !isHome) {
      setShowTooltip(false);
      return;
    }
    const delay = setTimeout(() => {
      setShowTooltip(true);
      tooltipTimer.current = setTimeout(() => setShowTooltip(false), 8000);
    }, 800);
    return () => { clearTimeout(delay); clearTimeout(tooltipTimer.current); };
  }, [isLoggedIn, isHome]);

  const dismissTooltip = () => {
    setShowTooltip(false);
    clearTimeout(tooltipTimer.current);
  };
const handleCartClick = () => {
 
    setShowCartMessage(true);

    setTimeout(() => {
      setShowCartMessage(false);
    }, 3000);

    return;
  
 
};

const handleWishListClick = () => {
 
    setShowWishListMessage(true);

    setTimeout(() => {
      setShowWishListMessage(false);
    }, 3000);

    return;
  
 
};
  return (
    <div className="sticky top-0 z-50 bg-[#0B0F1A] border-b border-white/10">
{showCartMessage && (
  <div
    className="fixed inset-0 z-[99999] flex items-center justify-center"
    style={{
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(6px)",
    }}
  >
    <div
      style={{
        width: "420px",
        maxWidth: "90%",
        background:
          "linear-gradient(180deg,#111827 0%, #0b1020 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "22px",
        padding: "28px",
        boxShadow: "0 20px 60px rgba(0,0,0,.5)",
        position: "relative",
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => setShowCartMessage(false)}
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,.1)",
          background: "rgba(255,255,255,.04)",
          color: "#fff",
          cursor: "pointer",
          fontSize: "18px",
        }}
      >
        ✕
      </button>

      {/* Icon */}
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          margin: "0 auto 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg,#7c3aed,#ec4899)",
        }}
      >
        <FiShoppingCart size={30} color="#fff" />
      </div>

      <h2
        style={{
          color: "#fff",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: 700,
          marginBottom: "10px",
        }}
      >
        Login Required
      </h2>

      <p
        style={{
          color: "rgba(255,255,255,.7)",
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: "24px",
        }}
      >
        Please login to access your cart items and continue shopping.
      </p>

      <button
        onClick={() => {
          setShowLoginCartModal(false);
          navigate("/login");
        }}
        style={{
          width: "100%",
          padding: "14px",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
          color: "#fff",
          fontWeight: 700,
          fontSize: "15px",
          background:
            "linear-gradient(90deg,#7c3aed,#ec4899)",
        }}
      >
        Login Now
      </button>
    </div>
  </div>
)}
{showWishListMessage && (
  <div
    className="fixed inset-0 z-[99999] flex items-center justify-center"
    style={{
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(6px)",
    }}
  >
    <div
      style={{
        width: "420px",
        maxWidth: "90%",
        background:
          "linear-gradient(180deg,#111827 0%, #0b1020 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "22px",
        padding: "28px",
        boxShadow: "0 20px 60px rgba(0,0,0,.5)",
        position: "relative",
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => setShowWishListMessage(false)}
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,.1)",
          background: "rgba(255,255,255,.04)",
          color: "#fff",
          cursor: "pointer",
          fontSize: "18px",
        }}
      >
        ✕
      </button>

      {/* Icon */}
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          margin: "0 auto 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg,#7c3aed,#ec4899)",
        }}
      >
        <FiShoppingCart size={30} color="#fff" />
      </div>

      <h2
        style={{
          color: "#fff",
          textAlign: "center",
          fontSize: "24px",
          fontWeight: 700,
          marginBottom: "10px",
        }}
      >
        Login Required
      </h2>

      <p
        style={{
          color: "rgba(255,255,255,.7)",
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: "24px",
        }}
      >
        Please login to access your wishlist items and continue shopping.
      </p>

      <button
        onClick={() => {
          setShowLoginCartModal(false);
          navigate("/login");
        }}
        style={{
          width: "100%",
          padding: "14px",
          border: "none",
          borderRadius: "14px",
          cursor: "pointer",
          color: "#fff",
          fontWeight: 700,
          fontSize: "15px",
          background:
            "linear-gradient(90deg,#7c3aed,#ec4899)",
        }}
      >
        Login Now
      </button>
    </div>
  </div>
)}
      {/* ── Main bar ── */}
      <div className="flex items-center px-4 md:px-6 py-3 max-w-screen-xl mx-auto gap-3">

        {/* Logo + Brand Text — always visible on all screen sizes */}
       <div
  className="flex items-center gap-2 cursor-pointer shrink-0"
  onClick={() => navigate("/")}
>
  <img
    src={appLogo}
    alt="app-logo"
    className="h-12 md:h-10 w-auto"
  />

  <span
    style={{
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 900,
      background:
        "linear-gradient(90deg,#ff0000 0%,#ff5e00 40%,#ff9d00 70%,#ffd000 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: "-0.06em",
      lineHeight: "1",
    }}
    className="text-[24px] sm:text-[28px] md:text-[24px]"
  >
    medocart
  </span>
</div>

        {/* Search — desktop only */}
        <div className="hidden md:flex flex-1 mx-4 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 rounded-xl outline-none text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 transition-colors"
            placeholder="Search for T-shirts, Hoodies..."
          />
        </div>

        {/* Right side — Login always visible + desktop extras + hamburger */}
        <div className="flex items-center gap-3 ml-auto">

          {/* Login button — always visible on all screen sizes */}
          <div className="relative">
            <button
              onClick={() => { dismissTooltip(); navigate("/login"); }}
              className="flex items-center px-4 py-1.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:shadow-pink-500/40 transition whitespace-nowrap"
            >
              Login
            </button>

            {/* Floating tooltip — desktop only, shakes */}
            {showTooltip && (
              <div
                className="tooltip-shake absolute z-50 hidden md:block"
                style={{ top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
              >
                <div
                  className="mx-auto"
                  style={{
                    width: 0, height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderBottom: "8px solid white",
                  }}
                />
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
          <button onClick={handleWishListClick} className="hidden md:flex items-center gap-1.5 text-sm text-white/80 hover:text-pink-400 transition-colors">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Wishlist
          </button>

          {/* Cart — desktop only */}
          <button onClick={handleCartClick} className="hidden md:flex relative items-center gap-1.5 text-sm text-white/80 hover:text-purple-400 transition">
             <FiShoppingCart className="w-5 h-5 shrink-0" />
            Cart
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden text-white text-xl leading-none"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? "✖" : "☰"}
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
            <button onClick={handleWishListClick} className="flex items-center gap-1.5 text-sm text-white/80 hover:text-pink-400 transition-colors">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Wishlist
            </button>

            <button  onClick={handleCartClick} className="relative flex items-center gap-1.5 text-sm text-white/80 hover:text-purple-400 transition">
               <FiShoppingCart className="w-5 h-5 shrink-0" />
               Cart
            </button>
          </div>
        </div>
      </div>

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
        .tooltip-in    { animation: tooltipIn 0.3s ease forwards; }
      `}</style>
    </div>
  );
}