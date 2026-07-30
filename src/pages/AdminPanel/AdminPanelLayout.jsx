// AdminPanelLayout.jsx
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import appLogo from "../../assets/images/appImage/app-logo.png";
const NAV_ITEMS = [
  {
    label: "Dashboard", to: "", end: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    label: "Listing Products", to: "listing",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
  },
  {
    label: "Orders", to: "orders",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    label: "Feedback", to: "feedback",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

const LogoutIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function AdminPanelLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogout, setShowLogout] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navRefs = useRef([]);
  const mobileRefs = useRef([]);
  const [indicator, setIndicator] = useState({ top: 0, height: 0, opacity: 0 });
  const [mobileInd, setMobileInd] = useState({ left: 0, width: 0, opacity: 0 });

  const getActiveIndex = () => {
    const p = location.pathname;
    if (p.includes("/listing")) return 1;
    if (p.includes("/orders")) return 2;
    if (p.includes("/feedback")) return 3;
    return 0;
  };

  useEffect(() => {
    const idx = getActiveIndex();
    const el = navRefs.current[idx];
    if (el) setIndicator({ top: el.offsetTop + 4, height: el.offsetHeight - 8, opacity: 1 });
  }, [location.pathname]);

  useEffect(() => {
    const idx = getActiveIndex();
    const el = mobileRefs.current[idx];
    if (el) setMobileInd({ left: el.offsetLeft + 4, width: el.offsetWidth - 8, opacity: 1 });
  }, [location.pathname]);

  const Sidebar = ({ onClose }) => (
    <>
      {/* Brand */}
      <div className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate("/user/dashboard")}>
                 <img src={appLogo} alt="app-logo" className="h-9 md:h-10 w-auto" />
                 <div className="hidden sm:flex flex-col leading-none">
                   <span className="text-[10px] md:text-[11px] tracking-[0.3em] text-yellow-400/70 font-light">MIDNIGHT</span>
                   <span className="text-[10px] md:text-[11px] tracking-[0.3em] text-yellow-400/70 font-light">— AURA —</span>
                 </div>
               </div>
      </div>

      {/* Admin info */}
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "linear-gradient(135deg,#7c3aed,#d97706)", color: "#fff" }}>A</div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#fff" }}>Admin</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>Super Admin</p>
          </div>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}>
            Live
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="relative py-3 px-3 flex-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.22)" }}>Navigation</p>

        {/* Sliding indicator */}
        <span className="absolute left-3 right-3 rounded-xl pointer-events-none"
          style={{
            top: indicator.top, height: indicator.height,
            background: "linear-gradient(135deg,rgba(139,92,246,0.22),rgba(124,58,237,0.10))",
            border: "1px solid rgba(139,92,246,0.35)",
            opacity: indicator.opacity,
            transition: "top 0.3s cubic-bezier(0.4,0,0.2,1), height 0.3s, opacity 0.2s",
            zIndex: 0,
          }}
        />

        {NAV_ITEMS.map((item, i) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            ref={(el) => (navRefs.current[i] = el)}
            onClick={onClose}
            className="relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200"
            style={({ isActive }) => ({
              color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.5)",
              zIndex: 1, textDecoration: "none",
            })}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "10px 0" }}/>

        <button onClick={() => { setShowLogout(true); onClose?.(); }}
          className="relative flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200"
          style={{ color: "#f87171", background: "transparent", border: "none", cursor: "pointer", zIndex: 1 }}>
          <LogoutIcon /> Logout
        </button>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg,#0E1320 0%,#1a1a24 100%)" }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 shrink-0 h-screen sticky top-0"
        style={{
          background: "rgba(255,255,255,0.032)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(20px)",
        }}>
        <Sidebar />
      </aside>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}/>
          <aside className="relative w-64 h-full flex flex-col z-10"
            style={{ background: "#0d1220", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
            <Sidebar onClose={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-3.5 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>

          {/* Hamburger */}
          <button className="md:hidden p-2 rounded-xl shrink-0" onClick={() => setDrawerOpen(true)}
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input placeholder="Search anything…"
              className="w-full pl-8 pr-4 py-2 text-sm rounded-xl outline-none"
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)", caretColor: "#a78bfa",
              }} />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Bell */}
            <button className="relative p-2 rounded-xl shrink-0"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ background: "#7c3aed", boxShadow: "0 0 6px rgba(124,58,237,0.8)" }}/>
            </button>

            {/* Admin badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.22)" }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#7c3aed,#d97706)", color: "#fff" }}>A</div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold leading-none" style={{ color: "#c4b5fd" }}>Admin</p>
                <p className="text-xs leading-none mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center px-1 py-1.5"
        style={{ background: "rgba(13,18,32,0.97)", borderTop: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)" }}>

        <span className="absolute bottom-1.5 rounded-xl pointer-events-none"
          style={{
            left: mobileInd.left, width: mobileInd.width, height: "calc(100% - 12px)",
            background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(124,58,237,0.10))",
            border: "1px solid rgba(139,92,246,0.3)",
            opacity: mobileInd.opacity,
            transition: "left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s",
            zIndex: 0,
          }}
        />

        {NAV_ITEMS.map((item, i) => (
          <NavLink key={item.to} to={item.to} end={item.end}
            ref={(el) => (mobileRefs.current[i] = el)}
            className="relative flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors duration-200"
            style={({ isActive }) => ({ color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.38)", zIndex: 1, textDecoration: "none" })}>
            {item.icon}
            <span style={{ fontSize: "9px" }}>{item.label.split(" ")[0]}</span>
          </NavLink>
        ))}

        <button onClick={() => setShowLogout(true)}
          className="relative flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl text-xs font-medium"
          style={{ color: "#f87171", background: "transparent", border: "none", cursor: "pointer", zIndex: 1 }}>
          <LogoutIcon />
          <span style={{ fontSize: "9px" }}>Logout</span>
        </button>
      </nav>

      {/* ── Logout Popup ── */}
      {showLogout && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowLogout(false)}>
          <div className="w-full max-w-sm rounded-2xl p-7 text-center"
            style={{ background: "#141820", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
              <LogoutIcon />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: "#fff" }}>Log out?</h3>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              You'll be signed out of the admin panel.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                Cancel
              </button>
              <button onClick={() => { localStorage.removeItem("admin"); navigate("/"); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff", boxShadow: "0 4px 16px rgba(220,38,38,0.35)" }}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}