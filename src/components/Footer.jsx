import { useNavigate } from "react-router-dom";
import appLogo from "../assets/images/appImage/chomoktomok-logo.png";
import InstallApp from "./InstallApp"; // adjust path as needed

// ── Colorful social icons (SVG inline, official brand colors) ─────────────────
const socials = [
  {
    label: "Instagram",
    href: "https://instagram.com",
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
    href: "https://youtube.com",
    color: "#FF0000",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M21.593 7.203a2.506 2.506 0 00-1.762-1.766C18.265 5.007 12 5 12 5s-6.264-.007-7.831.44a2.506 2.506 0 00-1.762 1.767C2.004 8.775 2 12.001 2 12.001s.004 3.226.407 4.797a2.506 2.506 0 001.762 1.766C5.736 19 12 19 12 19s6.265.007 7.831-.44a2.506 2.506 0 001.762-1.766C21.996 15.226 22 12 22 12s-.004-3.225-.407-4.797zM9.999 15.005V9l5.198 3.001-5.198 3.004z"/>
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://x.com",
    color: "#ffffff",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.25 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com",
    color: "#5865F2",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const navigate = useNavigate();

  return (
    <>
      {/* Floating install banner — renders itself only when PWA prompt is available */}
      <InstallApp variant="banner" />

      <footer className="bg-[#080c14] border-t border-white/5">
        <div className="max-w-screen-xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

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
              {["T-Shirts", "Hoodies", "Oversized", "Accessories"].map((l) => (
                <p
                  key={l}
                  onClick={() => navigate("/user/dashboard")}
                  className="text-white/30 text-xs mb-2 hover:text-white/70 cursor-pointer transition-colors"
                >
                  {l}
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
          <div className="border-t border-white/5 pt-5 text-center">
            <p className="text-white/20 text-xs">© 2026 Midnight Aura. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}