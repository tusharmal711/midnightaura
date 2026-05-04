import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import appLogo from "../assets/images/appImage/app-logo.png";


export default function Navbar() {
  const [cartCount] = useState(3);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn] = useState(false); // flip to true once auth is wired
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimer = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  // Show tooltip only on "/" and only when not logged in
  useEffect(() => {
    if (isLoggedIn || !isHome) {
      setShowTooltip(false);
      return;
    }
    const delay = setTimeout(() => {
      setShowTooltip(true);
      // Auto-hide after 5s total
      tooltipTimer.current = setTimeout(() => setShowTooltip(false), 8000);
    }, 800);
    return () => { clearTimeout(delay); clearTimeout(tooltipTimer.current); };
  }, [isLoggedIn, isHome]);

  const dismissTooltip = () => {
    setShowTooltip(false);
    clearTimeout(tooltipTimer.current);
  };

  return (
    <div className="sticky top-0 z-50 bg-[#0B0F1A] border-b border-white/10">

      {/* ── Main bar ── */}
      <div className="flex flex-wrap items-center gap-y-3 px-4 md:px-6 py-3 max-w-screen-xl mx-auto">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate("/")}>
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
          <ActionButtons
            cartCount={cartCount}
            navigate={navigate}
            showTooltip={showTooltip}
            onDismiss={dismissTooltip}
          />
        </div>

        {/* Hamburger — mobile */}
        <button className="md:hidden ml-auto text-white text-xl leading-none" aria-label="Toggle menu" onClick={() => setMenuOpen((o) => !o)}>
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pb-4 flex flex-col gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-2 rounded-xl outline-none text-sm text-white placeholder:text-white/30 focus:border-purple-500/50 transition-colors"
              placeholder="Search..."
            />
          </div>
          <ActionButtons cartCount={cartCount} navigate={navigate} stack />
        </div>
      </div>

      <style>{`
        /* 
          Shake for ~1s, pause for ~1.5s, repeat.
          Total cycle = 2.5s: shake occupies first 40% (1s), rest is pause.
        */
        @keyframes shakePulse {
          0%                { transform: translateX(-50%); }
          4%                { transform: translateX(calc(-50% - 5px)); }
          8%                { transform: translateX(calc(-50% + 5px)); }
          12%               { transform: translateX(calc(-50% - 4px)); }
          16%               { transform: translateX(calc(-50% + 4px)); }
          20%               { transform: translateX(calc(-50% - 3px)); }
          24%               { transform: translateX(calc(-50% + 3px)); }
          28%               { transform: translateX(calc(-50% - 2px)); }
          32%               { transform: translateX(calc(-50% + 2px)); }
          36%               { transform: translateX(calc(-50% - 1px)); }
          40%               { transform: translateX(-50%); }
          /* 40%–100% = pause (no movement) */
          100%              { transform: translateX(-50%); }
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

/* ─────────────────────────────────────────────────────
   ActionButtons
   - desktop: tooltip shakes below Login, Login itself untouched
   - mobile (stack=true): plain, no tooltip
───────────────────────────────────────────────────── */
function ActionButtons({ cartCount, navigate, showTooltip = false, onDismiss, stack = false }) {
  return (
    <div className={`flex ${stack ? "flex-col w-full items-start" : "flex-row items-center"} gap-3`}>

      {/* Login button + floating tooltip */}
      <div className="relative">

        {/* Actual Login button — no shake, no change */}
        <button
          onClick={() => { onDismiss?.(); navigate("/login"); }}
          className={`flex items-center px-4 py-1.5 text-sm text-white rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:shadow-pink-500/40 transition ${stack ? "w-full justify-center" : ""}`}
        >
          Login
        </button>

        {/* Floating tooltip — only this shakes, desktop only */}
        {showTooltip && !stack && (
          <div
            className="tooltip-shake absolute z-50"
            style={{ top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
          >
            {/* Upward arrow */}
            <div
              className="mx-auto"
              style={{
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderBottom: "8px solid white",
              }}
            />
            {/* White box */}
            <div
              onClick={() => { onDismiss(); navigate("/login"); }}
              className="cursor-pointer bg-white text-[#3730a3] font-bold text-sm px-6 py-2.5 rounded-md shadow-2xl whitespace-nowrap hover:bg-purple-50 transition-colors select-none"
            >
              Login
            </div>
          </div>
        )}
      </div>

      {/* Wishlist */}
      <button className="flex items-center gap-1.5 text-sm text-white/80 hover:text-pink-400 transition-colors">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        Wishlist
      </button>

      {/* Cart */}
      <button className="relative flex items-center gap-1.5 text-sm text-white/80 hover:text-purple-400 transition">
        🛒 Cart
        <span className="absolute -top-2 -right-3 bg-purple-600 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          {cartCount}
        </span>
      </button>
    </div>
  );
}