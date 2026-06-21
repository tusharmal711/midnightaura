import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import appLogo from "../assets/images/appImage/chomoktomok-logo.png";

// ── Info-page navigation ──────────────────────────────────────────────────────
// Deliberately distinct from the main shop Navbar: no pill tabs, no CTA button.
// This is the "reading mode" nav — quieter, editorial, built for trust-building
// pages (About / Contact / Legal) rather than browsing/shopping.
const links = [
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms & Conditions", path: "/terms-and-conditions" },
  { label: "Return Policy", path: "/return-policy" },
];

export default function InfoNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-2xl "
      style={{
        background: "#080C13",
       
      }}
    >
      {/* Hairline gradient accent — the one signature touch on this nav */}
      <div
        className="h-[2px] w-full"
        style={{ background: "linear-gradient(90deg, transparent, #9333ea, #34d399, transparent)" }}
      />

      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Brand ── */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 shrink-0"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <img src={appLogo} alt="ChomokTomok" className="h-9 w-auto" />
            <span className="hidden sm:inline text-white/25 text-[10px] uppercase tracking-[0.25em] font-medium pl-2 border-l border-white/10 ml-1">
              Info
            </span>
          </button>

          {/* ── Desktop links ── */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map(({ label, path }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="relative py-2 text-[13px] font-medium tracking-wide transition-colors duration-200"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.45)",
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                >
                  {label}
                  <span
                    className="absolute left-0 -bottom-[1px] h-[1.5px] transition-all duration-300"
                    style={{
                      width: isActive ? "100%" : "0%",
                      background: "linear-gradient(90deg,#9333ea,#34d399)",
                    }}
                  />
                </button>
              );
            })}
          </nav>

          {/* ── Back to shop (desktop) ── */}
          <button
            onClick={() => navigate("/")}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(147,51,234,0.18), rgba(52,211,153,0.14))",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            Back to Shop
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>

          {/* ── Mobile menu toggle ── */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile dropdown ── */}
      {open && (
        <nav className="md:hidden border-t border-white/5 bg-[#080c14] px-6 py-4 flex flex-col gap-1">
          {links.map(({ label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => { navigate(path); setOpen(false); }}
                className="text-left py-3 text-sm font-medium border-b border-white/5 last:border-0"
                style={{
                  background: "none",
                  border: "none",
                  color: isActive ? "#34d399" : "rgba(255,255,255,0.6)",
                }}
              >
                {label}
              </button>
            );
          })}
          <button
            onClick={() => { navigate("/"); setOpen(false); }}
            className="mt-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-white text-center"
            style={{ background: "linear-gradient(135deg,#9333ea,#34d399)" }}
          >
            Back to Shop
          </button>
        </nav>
      )}
    </header>
  );
}