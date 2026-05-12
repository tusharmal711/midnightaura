// CategoryLayout.jsx
// Added: on first mobile open, the categories bar auto-scrolls right then back
// to hint that more categories exist beyond the visible area.

import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FiShoppingBag,
  FiUser,
  FiUsers,
  FiSmile,
  FiStar,
  FiPackage,
  FiBox,
} from "react-icons/fi";

const categories = [
  { label: "For You",           path: "/",                       icon: <FiShoppingBag /> },
  { label: "Men",               path: "/categories/men",         icon: <FiUser /> },
  { label: "Women",             path: "/categories/women",       icon: <FiUsers /> },
  { label: "Kids",              path: "/categories/kids",        icon: <FiSmile /> },
  { label: "Earrings",          path: "/categories/earrings",    icon: <FiStar /> },
  { label: "Necklaces",         path: "/categories/necklaces",   icon: <FiPackage /> },
  { label: "Oversized",         path: "/categories/oversized",   icon: <FiBox /> },
  { label: "Hoodies",           path: "/categories/hoodies",     icon: <FiPackage /> },
  { label: "Customize T-shirt", path: "/categories/customize",   special: true },
];

// Key used to track if the hint has already been shown this session
const HINT_KEY = "ma_cat_hint_shown";

export default function Categories() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const btnRefs  = useRef([]);
  const trackRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  // derive active from the current URL
  const activeIndex = categories.findIndex((c) => c.path === location.pathname);

  // ── Hint scroll animation (mobile only, once per session) ──────────────────
  const hintDone = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Only run on mobile (narrow screens) and only once per session
    const isMobile = window.innerWidth < 768;
    const alreadyShown = sessionStorage.getItem(HINT_KEY);
    if (!isMobile || alreadyShown || hintDone.current) return;

    hintDone.current = true;

    // Wait a beat after mount so the bar is visible first
    const t1 = setTimeout(() => {
      // Scroll right smoothly to reveal hidden categories
      track.scrollTo({ left: 220, behavior: "smooth" });

      // Then scroll back to start
      const t2 = setTimeout(() => {
        track.scrollTo({ left: 0, behavior: "smooth" });
        sessionStorage.setItem(HINT_KEY, "1");
      }, 900); // hold at end for 900ms

      return () => clearTimeout(t2);
    }, 600); // delay before starting

    return () => clearTimeout(t1);
  }, []);

  // ── Pill position ──────────────────────────────────────────────────────────
  useEffect(() => {
    const idx   = activeIndex === -1 ? 0 : activeIndex;
    const btn   = btnRefs.current[idx];
    const track = trackRef.current;
    if (!btn || !track) return;

    const btnRect   = btn.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();

    setPill({
      left:  btnRect.left - trackRect.left + track.scrollLeft,
      width: btnRect.width,
      ready: true,
    });
  }, [activeIndex, scrolled]);

  // ── Sticky scroll state ────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0E1320]">

      {/* ── Sticky Categories Bar ── */}
      <div className="sticky top-[64px] z-40 bg-[#0E1320]/95 backdrop-blur-md border-b border-white/5 transition-all duration-300">

        {/* Fade-out gradient on right edge to hint scrollability */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 40,
            background: "linear-gradient(to right, transparent, #0E1320ee)",
            zIndex: 20,
            pointerEvents: "none",
          }}
        />

        <div
          ref={trackRef}
          className={`relative flex gap-1.5 px-4 max-w-screen-xl mx-auto overflow-x-auto scrollbar-none transition-all duration-300 ${
            scrolled ? "py-1" : "py-2"
          }`}
        >
          {pill.ready && (
            <span
              aria-hidden="true"
              className="absolute top-0 bottom-0 my-auto rounded-md bg-purple-700 shadow-md shadow-purple-700/40 pointer-events-none"
              style={{
                height:     scrolled ? 28 : 52,
                left:       pill.left,
                width:      pill.width,
                transition: "left 0.35s cubic-bezier(.77,0,.18,1), width 0.35s cubic-bezier(.77,0,.18,1), height 0.3s",
                zIndex:     0,
              }}
            />
          )}

          {categories.map((cat, i) => (
            <button
              key={i}
              ref={(el) => (btnRefs.current[i] = el)}
              onClick={() => navigate(cat.path)}
              className={`
                relative z-10
                flex flex-col items-center justify-center
                px-3 rounded-md font-medium
                whitespace-nowrap shrink-0
                transition-colors duration-200
                text-[11px] sm:text-xs
                ${
                  cat.special
                    ? "py-1.5 px-4 text-white bg-gradient-to-r from-green-500 to-emerald-500 animate-[blinkGlow_1.5s_infinite]"
                    : location.pathname === cat.path
                    ? "min-w-[64px] sm:min-w-[72px] text-white"
                    : "min-w-[64px] sm:min-w-[72px] text-white/60 hover:text-white"
                }
              `}
            >
              {!cat.special && (
                <span
                  className={`flex items-center justify-center transition-all duration-300 text-lg sm:text-xl ${
                    scrolled
                      ? "opacity-0 scale-75 h-0 mb-0 overflow-hidden"
                      : "opacity-100 scale-100 h-[22px] mb-[3px]"
                  }`}
                >
                  {cat.icon}
                </span>
              )}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <style>{`
          @keyframes blinkGlow {
            0%, 100% { box-shadow: 0 0 8px rgba(34,197,94,0.4), 0 0 16px rgba(34,197,94,0.3); }
            50%       { box-shadow: 0 0 20px rgba(16,185,129,0.8), 0 0 35px rgba(16,185,129,0.5); }
          }
          .scrollbar-none::-webkit-scrollbar { display: none; }
          .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>

      {/* ── Child route renders here ── */}
      <main className="max-w-screen-xl mx-auto">
        <Outlet />
      </main>

    </div>
  );
}