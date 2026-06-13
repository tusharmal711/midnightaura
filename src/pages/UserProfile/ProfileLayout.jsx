// ProfileLayout.jsx

import {
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  useState,
  useRef,
  useEffect,
} from "react";

import Cookies from "js-cookie";
import { API } from "../../api";

const NAV_ITEMS = [
  { label: "Profile Info", to: "", end: true },
  { label: "Orders",       to: "orders" },
  { label: "Cart",         to: "cart" },
];

// ── Icons ─────────────────────────────────────────────
const ProfileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const OrderIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV_ICONS = [ProfileIcon, OrderIcon, CartIcon];

// ── Helpers ────────────────────────────────────────────
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user") || Cookies.get("user");
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
};

const getStoredEmail = () => getStoredUser()?.email ?? null;

// accessToken was stored at login time inside the user object
const getAccessToken = () => getStoredUser()?.accessToken ?? null;

const getStoredFcmToken = () => {
  try { return localStorage.getItem("fcmToken") || null; } catch (_) { return null; }
};

// ── Main Component ───────────────────────────────────
export default function ProfileLayout() {

  const navigate = useNavigate();
  const location = useLocation();

  const navRefs       = useRef([]);
  const mobileNavRefs = useRef([]);

  const [indicatorStyle,  setIndicatorStyle]  = useState({ top: 0, height: 0, opacity: 0 });
  const [mobileIndicator, setMobileIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [loggingOut,      setLoggingOut]      = useState(false);

  const [userName,     setUserName]     = useState("User");
  const [customerId,   setCustomerId]   = useState("User");
  const [userInitials, setUserInitials] = useState("U");

  // ── Fetch User Profile ─────────────────────────────
  const fetchUser = async () => {
    try {
      const email = getStoredEmail();
      if (!email) return;
      const res = await API.post("/user/getProfile", { email });
      if (res.data.success) {
        const username = res.data.user?.username   || "User";
        const cId      = res.data.user?.customerId || "None";
        setUserName(username);
        setCustomerId(cId);
        setUserInitials(
          username.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        );
      }
    } catch (error) { console.log(error); }
  };

  useEffect(() => {
    fetchUser();
    const interval = setInterval(fetchUser, 2000);
    return () => clearInterval(interval);
  }, []);

  // ── Active Tab ─────────────────────────────────────
  const getActiveIndex = () => {
    const path = location.pathname;
    if (path.endsWith("/orders")) return 1;
    if (path.endsWith("/cart"))   return 2;
    return 0;
  };

  useEffect(() => {
    const idx = getActiveIndex();
    const el  = navRefs.current[idx];
    if (el) setIndicatorStyle({ top: el.offsetTop + 4, height: el.offsetHeight - 8, opacity: 1 });
  }, [location.pathname]);

  useEffect(() => {
    const idx = getActiveIndex();
    const el  = mobileNavRefs.current[idx];
    if (el) setMobileIndicator({ left: el.offsetLeft + 4, width: el.offsetWidth - 8, opacity: 1 });
  }, [location.pathname]);

  // ── Logout ─────────────────────────────────────────
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const fcmToken   = getStoredFcmToken();
      const accessToken = getAccessToken();

      if (fcmToken) {
        // Backend removeFcmToken uses req.user (JWT middleware),
        // so we pass the token in the Authorization header.
        await API.post(
          "/user/removeFcmToken",
          { fcmToken , customerId},
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        localStorage.removeItem("fcmToken");
        console.log("FCM token removed from server");
      }
    } catch (error) {
      // Non-fatal — always proceed with local logout
      console.error("FCM token removal failed:", error.response?.data?.message || error.message);
    } finally {
      localStorage.removeItem("user");
      Cookies.remove("user");
      setLoggingOut(false);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0E1320 0%, #1a1a24 100%)" }}>

      {/* ── Desktop Layout ───────────────────────── */}
      <div className="hidden md:flex max-w-6xl mx-auto px-4 py-10 gap-6 items-start">

        <aside
          className="w-60 lg:w-64 rounded-2xl overflow-hidden shrink-0 sticky top-10"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
        >
          <div
            className="px-5 py-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(234,179,8,0.08))" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-4 text-lg font-bold"
              style={{ background: "linear-gradient(135deg, #7c3aed, #d97706)", color: "#fff", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}
            >
              {userInitials}
            </div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.38)" }}>Hello,</p>
            <p className="text-xl font-bold" style={{ color: "#fff" }}>{userName}</p>
            <p className="text-sm" style={{ color: "#fff" }}>Id : {customerId}</p>
          </div>

          <nav className="relative py-3 px-3">
            <span
              className="absolute left-3 right-3 rounded-xl pointer-events-none"
              style={{
                top:        indicatorStyle.top,
                height:     indicatorStyle.height,
                background: "linear-gradient(135deg, rgba(139,92,246,0.22), rgba(124,58,237,0.12))",
                border:     "1px solid rgba(139,92,246,0.35)",
                opacity:    indicatorStyle.opacity,
                transition: "top 0.3s cubic-bezier(0.4,0,0.2,1), height 0.3s",
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
                  className="relative flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl"
                  style={({ isActive }) => ({ color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.5)", textDecoration: "none", zIndex: 1 })}
                >
                  <Icon />
                  {item.label}
                </NavLink>
              );
            })}

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "8px 0" }} />

            <button
              onClick={() => setShowLogoutPopup(true)}
              className="relative flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl"
              style={{ color: "#f87171", background: "transparent", border: "none", cursor: "pointer" }}
            >
              <LogoutIcon />
              Logout
            </button>
          </nav>
        </aside>

        <main
          className="flex-1 rounded-2xl p-6 lg:p-8 min-h-[500px]"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
        >
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Layout ───────────────────────── */}
      <div className="md:hidden flex flex-col min-h-screen">

        <div
          className="px-4 pt-6 pb-4 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(234,179,8,0.06))", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #7c3aed, #d97706)", color: "#fff" }}
          >
            {userInitials}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.38)" }}>Hello,</p>
            <p className="text-sm font-bold" style={{ color: "#fff" }}>{userName}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Id : {customerId}</p>
          </div>
          <button
            onClick={() => setShowLogoutPopup(true)}
            className="ml-auto px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}
          >
            Logout
          </button>
        </div>

        <main className="flex-1 px-4 py-5 pb-28">
          <div
            className="rounded-2xl p-5 min-h-[400px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Outlet />
          </div>
        </main>

        <nav
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center px-1 py-1.5"
          style={{ background: "rgba(13,18,32,0.97)", borderTop: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)" }}
        >
          <span
            className="absolute bottom-1.5 rounded-xl pointer-events-none"
            style={{
              left:       mobileIndicator.left,
              width:      mobileIndicator.width,
              height:     "calc(100% - 12px)",
              background: "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.10))",
              border:     "1px solid rgba(139,92,246,0.3)",
              opacity:    mobileIndicator.opacity,
              transition: "left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s",
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
                className="relative flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl text-xs font-medium transition-colors duration-200"
                style={({ isActive }) => ({ color: isActive ? "#c4b5fd" : "rgba(255,255,255,0.38)", zIndex: 1, textDecoration: "none" })}
              >
                <Icon />
                <span style={{ fontSize: "9px" }}>{item.label.split(" ")[0]}</span>
              </NavLink>
            );
          })}

          <button
            onClick={() => setShowLogoutPopup(true)}
            className="relative flex flex-col items-center gap-0.5 flex-1 py-1.5 rounded-xl text-xs font-medium"
            style={{ color: "#f87171", background: "transparent", border: "none", cursor: "pointer", zIndex: 1 }}
          >
            <LogoutIcon />
            <span style={{ fontSize: "9px" }}>Logout</span>
          </button>
        </nav>
      </div>

      {/* ── Logout Popup ───────────────────────── */}
      {showLogoutPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          onClick={() => !loggingOut && setShowLogoutPopup(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-7 text-center"
            style={{ background: "#141820", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}
            >
              <LogoutIcon />
            </div>

            <h3 className="text-lg font-bold mb-1" style={{ color: "#fff" }}>Log out?</h3>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>You'll need to sign in again.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutPopup(false)}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border:     "1px solid rgba(255,255,255,0.1)",
                  color:      loggingOut ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)",
                  cursor:     loggingOut ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{
                  background: loggingOut ? "rgba(220,38,38,0.4)" : "linear-gradient(135deg, #dc2626, #b91c1c)",
                  color:      "#fff",
                  boxShadow:  loggingOut ? "none" : "0 4px 16px rgba(220,38,38,0.35)",
                  cursor:     loggingOut ? "not-allowed" : "pointer",
                }}
              >
                {loggingOut ? (
                  <>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      style={{ animation: "pl-spin 0.75s linear infinite" }}
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Logging out…
                  </>
                ) : (
                  "Yes, Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pl-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}