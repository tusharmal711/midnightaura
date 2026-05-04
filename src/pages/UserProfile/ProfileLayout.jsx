// ProfileLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Categories from "../../components/Categories";

const NAV_ITEMS = [
  { label: "Profile Info", to: "", end: true },
  { label: "Orders", to: "orders" },
  { label: "Cart", to: "cart" },
];

// ── Icons ─────────────────────────────────────────────────────────
const ProfileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const OrderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV_ICONS = [ProfileIcon, OrderIcon, CartIcon];

export default function ProfileLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navRefs = useRef([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  // Mobile: bottom tab bar indicator (horizontal)
  const mobileNavRefs = useRef([]);
  const [mobileIndicator, setMobileIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  const getActiveIndex = () => {
    const path = location.pathname;
    if (path.endsWith("/orders")) return 1;
    if (path.endsWith("/cart")) return 2;
    return 0;
  };

  // Desktop sidebar indicator
  useEffect(() => {
    const idx = getActiveIndex();
    const el = navRefs.current[idx];
    if (el) {
      setIndicatorStyle({
        top: el.offsetTop + 4,
        height: el.offsetHeight - 8,
        opacity: 1,
      });
    }
  }, [location.pathname]);

  // Mobile bottom tab indicator
  useEffect(() => {
    const idx = getActiveIndex();
    const el = mobileNavRefs.current[idx];
    if (el) {
      setMobileIndicator({
        left: el.offsetLeft + 6,
        width: el.offsetWidth - 12,
        opacity: 1,
      });
    }
  }, [location.pathname]);

  return (
   
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0E1320 0%, #1a1a24 100%)" }}
    >
      
      {/* ── Desktop Layout ── */}
      <div className="hidden md:flex max-w-6xl mx-auto px-4 py-10 gap-6 items-start">

        {/* Sidebar */}
        <aside
          className="w-60 lg:w-64 rounded-2xl overflow-hidden shrink-0 sticky top-10"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* User greeting */}
          <div
            className="px-5 py-5"
            style={{
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(234,179,8,0.08))",
            }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center mb-3 text-base font-bold"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #d97706)",
                color: "#fff",
                boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              }}
            >
              TM
            </div>
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>Hello,</p>
            <p className="text-base font-bold tracking-wide" style={{ color: "#fff" }}>Tushar Mal</p>
          </div>

          {/* Nav */}
          <nav className="relative py-3 px-3">
            {/* Sliding indicator */}
            <span
              className="absolute left-3 right-3 rounded-xl pointer-events-none"
              style={{
                top: indicatorStyle.top,
                height: indicatorStyle.height,
                background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(124,58,237,0.12))",
                border: "1px solid rgba(139,92,246,0.35)",
                opacity: indicatorStyle.opacity,
                transition: "top 0.3s cubic-bezier(0.4,0,0.2,1), height 0.3s, opacity 0.2s",
                zIndex: 0,
              }}
            />

            {NAV_ITEMS.map((item, i) => {
              const Icon = NAV_ICONS[i];
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  ref={(el) => (navRefs.current[i] = el)}
                  className="relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200"
                  style={({ isActive }) => ({
                    color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.50)",
                    zIndex: 1,
                    textDecoration: "none",
                  })}
                >
                  <Icon />
                  {item.label}
                </NavLink>
              );
            })}

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "8px 0" }} />

            <button
              onClick={() => setShowLogoutPopup(true)}
              className="relative flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200"
              style={{ color: "#f87171", zIndex: 1, background: "transparent", border: "none", cursor: "pointer" }}
            >
              <LogoutIcon />
              Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <main
          className="flex-1 rounded-2xl p-6 lg:p-8 min-h-[500px]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Layout ── */}
      <div className="md:hidden flex flex-col min-h-screen">

        {/* Mobile Header */}
        <div
          className="px-4 pt-6 pb-4 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(234,179,8,0.06))",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #d97706)",
              color: "#fff",
              boxShadow: "0 3px 14px rgba(124,58,237,0.4)",
            }}
          >
            TM
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.38)" }}>Hello,</p>
            <p className="text-sm font-bold" style={{ color: "#fff" }}>Tushar Mal</p>
          </div>
          {/* Mobile logout */}
          <button
            onClick={() => setShowLogoutPopup(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.25)",
              color: "#f87171",
            }}
          >
            <LogoutIcon />
            Logout
          </button>
        </div>

        {/* Mobile Content */}
        <main className="flex-1 px-4 py-5 pb-28">
          <div
            className="rounded-2xl p-5 min-h-[400px]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Tab Bar */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2"
          style={{
            background: "rgba(14,19,32,0.96)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Sliding horizontal indicator */}
          <span
            className="absolute bottom-2 rounded-xl pointer-events-none"
            style={{
              left: mobileIndicator.left,
              width: mobileIndicator.width,
              height: "calc(100% - 16px)",
              background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(124,58,237,0.12))",
              border: "1px solid rgba(139,92,246,0.35)",
              opacity: mobileIndicator.opacity,
              transition: "left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s, opacity 0.2s",
              zIndex: 0,
            }}
          />

          {NAV_ITEMS.map((item, i) => {
            const Icon = NAV_ICONS[i];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                ref={(el) => (mobileNavRefs.current[i] = el)}
                className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-xs font-medium transition-colors duration-200 flex-1"
                style={({ isActive }) => ({
                  color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.42)",
                  zIndex: 1,
                  textDecoration: "none",
                })}
              >
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* ── Logout Confirmation Popup ── */}
      {showLogoutPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowLogoutPopup(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-7 text-center"
            style={{
              background: "#141820",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)" }}
            >
              <LogoutIcon />
            </div>

            <h3 className="text-lg font-bold mb-1" style={{ color: "#fff" }}>Log out?</h3>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              You'll need to sign in again to access your profile.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/");
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  color: "#fff",
                  boxShadow: "0 4px 16px rgba(220,38,38,0.35)",
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}