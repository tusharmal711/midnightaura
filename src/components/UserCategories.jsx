// CategoryLayout.jsx
// This is the LAYOUT component — it renders the sticky categories bar
// and an <Outlet /> below it where child routes render automatically.

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
  { label: "For You",           path: "/user/dashboard",    icon: <FiShoppingBag /> },
  { label: "Men",               path: "/user/dashboard/categories/men",         icon: <FiUser /> },
  { label: "Women",             path: "/user/dashboard/categories/women",       icon: <FiUsers /> },
  { label: "Kids",              path: "/user/dashboard/categories/kids",        icon: <FiSmile /> },
  { label: "Earrings",          path: "/user/dashboard/categories/earrings",    icon: <FiStar /> },
  { label: "Necklaces",         path: "/user/dashboard/categories/necklaces",   icon: <FiPackage /> },
  { label: "Oversized",         path: "/user/dashboard/categories/oversized",   icon: <FiBox /> },
  { label: "Hoodies",           path: "/user/dashboard/categories/hoodies",     icon: <FiPackage /> },
  { label: "Customize T-shirt", path: "/user/dashboard/categories/customize",   special: true },
];

export default function UserCategories() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const btnRefs  = useRef([]);
  const trackRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  // derive active from the current URL — no separate state needed
  const activeIndex = categories.findIndex((c) => c.path === location.pathname);

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0E1320]">

      {/* ── Sticky Categories Bar — unchanged visually ── */}
      <div className="sticky top-[64px] z-40 bg-[#0E1320]/95 backdrop-blur-md border-b border-white/5 transition-all duration-300">
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

      {/* ── Outlet: React Router renders the matched child route here ── */}
      <main className="max-w-screen-xl mx-auto">
        <Outlet />
      </main>

    </div>
  );
}