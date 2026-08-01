import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import appLogo from "../assets/images/appImage/chomoktomok-logo.png";
import InstallApp from "./InstallApp"; // adjust path as needed

// ── Colorful social icons (SVG inline, official brand colors) ─────────────────
const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/chomoktomok",
    color: "#E1306C",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="5.5" stroke="url(#ig-grad)" strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="1.8"/>
        <circle cx="17.5" cy="6.5" r="1.1" fill="url(#ig-grad)"/>
        <defs>
          <linearGradient id="ig-grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f9ce34"/>
            <stop offset="0.35" stopColor="#ee2a7b"/>
            <stop offset="1" stopColor="#6228d7"/>
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    color: "#1877F2",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@ChomokTomok",
    color: "#FF0000",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M21.593 7.203a2.506 2.506 0 00-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.44a2.506 2.506 0 00-1.762 1.767C2.004 8.775 2 12.001 2 12.001s.004 3.226.407 4.797a2.506 2.506 0 001.762 1.766C5.736 19 12 19 12 19s6.265.007 7.831-.44a2.506 2.506 0 001.762-1.766C21.996 15.226 22 12 22 12s-.004-3.225-.407-4.797zM9.999 15.005V9l5.198 3.001-5.198 3.004z"/>
      </svg>
    ),
  }
];

// ── Company / legal links ─────────────────────────────────────────────────────
const companyLinks = [
  { label: "About Us", path: "/about" },
  { label: "Contact Us", path: "/contact" },
  { label: "Privacy Policy", path: "/privacy-policy" },
  { label: "Terms & Conditions", path: "/terms-and-conditions" },
  { label: "Return Policy", path: "/return-policy" },
];

export default function Footer() {
  const navigate = useNavigate();

  // ── Login-aware shop category links ───────────────────────────────────────
  // Mirrors the same isLoggedIn check used for the home button elsewhere in
  // the app: logged-out users browse under /categories/*, logged-in users
  // browse under /user/dashboard/categories/* (same slugs, just nested under
  // the dashboard route). Built here — inside the component — instead of as
  // a static module-level array, so it re-evaluates the cookie on every
  // render and always points at the correct route for the current session.
  const isLoggedIn = !!Cookies.get("user");
  const dashboardPrefix = isLoggedIn ? "/user/dashboard" : "";

  const shopCategories = [
    { label: "Men",       path: `${dashboardPrefix}/categories/men` },
    { label: "Women",     path: `${dashboardPrefix}/categories/women` },
    { label: "Kids",      path: `${dashboardPrefix}/categories/kids` },
    { label: "Earrings",  path: `${dashboardPrefix}/categories/earrings` },
    { label: "Necklaces", path: `${dashboardPrefix}/categories/necklaces` },
    { label: "Oversized", path: `${dashboardPrefix}/categories/oversized` },
    { label: "Hoodies",   path: `${dashboardPrefix}/categories/hoodies` },
  ];

  return (
    <>
      {/* Floating install banner — renders itself only when PWA prompt is available */}
      <InstallApp variant="banner" />

      <footer className="bg-[#080c14] border-t border-white/5">
        <div className="max-w-screen-xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">

            {/* ── Brand ── */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <img src={appLogo} alt="app-logo" className="h-10 w-auto" />
              </div>
              <p className="text-white/30 text-xs leading-relaxed mb-5">
                Premium streetwear for every aura. Stand out. Be bold. Be you.
              </p>

              {/* ── Install buttons ── */}
              <div className="flex flex-col gap-2.5">

                {/* PWA install (shows only when browser supports it) */}
                <InstallApp variant="button" />

                {/* Play Store */}
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg,#0f1923,#0a2218)",
                    border: "1px solid rgba(52,211,153,0.3)",
                    boxShadow: "0 4px 20px rgba(52,211,153,0.12)",
                    textDecoration: "none",
                  }}
                >
                  {/* Play Store SVG */}
                  <svg width="20" height="20" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l236.6-235.8L47 0zm425.6 225.6l-58.9-34-67.7 67.8 67.7 67.8 60.1-34.5c17.1-9.8 17.1-36.4-.8-47.1l-.4.0zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" fill="url(#ps-grad)"/>
                    <defs>
                      <linearGradient id="ps-grad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#00d2ff"/>
                        <stop offset="0.33" stopColor="#34d399"/>
                        <stop offset="0.66" stopColor="#fbbf24"/>
                        <stop offset="1" stopColor="#f472b6"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="flex flex-col leading-tight">
                    <span className="text-white/40 text-[9px] tracking-wider uppercase">Get it on</span>
                    <span className="text-white text-xs font-bold">Google Play</span>
                  </div>
                </a>

              </div>
            </div>

            {/* ── Shop ── */}
            <div>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Shop</h4>
              {shopCategories.map(({ label, path }) => (
                <p
                  key={label}
                  onClick={() => navigate(path)}
                  className="text-white/30 text-xs mb-2 hover:text-white/70 cursor-pointer transition-colors"
                >
                  {label}
                </p>
              ))}
            </div>

            {/* ── Company ── */}
            <div>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Company</h4>
              {companyLinks.map(({ label, path }) => (
                <p
                  key={label}
                  onClick={() => navigate(path)}
                  className="text-white/30 text-xs mb-2 hover:text-white/70 cursor-pointer transition-colors"
                >
                  {label}
                </p>
              ))}
            </div>

            {/* ── Help ── */}
            <div>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Help</h4>
              {["FAQ", "Shipping", "Returns", "Track Order"].map((l) => (
                <p key={l} className="text-white/30 text-xs mb-2 hover:text-white/70 cursor-pointer transition-colors">{l}</p>
              ))}
            </div>

            {/* ── Follow ── */}
            <div>
              <h4 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Follow</h4>
              <div className="flex flex-col gap-2.5">
                {socials.map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 group transition-all duration-200"
                    style={{ textDecoration: "none" }}
                  >
                    <span
                      className="flex items-center justify-center w-7 h-7 rounded-lg transition-transform duration-200 group-hover:scale-110"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {icon}
                    </span>
                    <span className="text-white/30 text-xs group-hover:text-white/70 transition-colors">{label}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* ── Bottom bar ── */}
          <div className="border-t border-white/5 pt-5 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
            <p className="text-white/20 text-xs">© 2026 ChomokTomok. All rights reserved.</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span
                onClick={() => navigate("/privacy-policy")}
                className="text-white/20 text-xs hover:text-white/50 cursor-pointer transition-colors"
              >
                Privacy Policy
              </span>
              <span className="text-white/10">•</span>
              <span
                onClick={() => navigate("/terms-and-conditions")}
                className="text-white/20 text-xs hover:text-white/50 cursor-pointer transition-colors"
              >
                Terms & Conditions
              </span>
              <span className="text-white/10">•</span>
              <span
                onClick={() => navigate("/return-policy")}
                className="text-white/20 text-xs hover:text-white/50 cursor-pointer transition-colors"
              >
                Return Policy
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}