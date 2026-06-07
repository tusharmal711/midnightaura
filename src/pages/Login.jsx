import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api";
import Cookies from "js-cookie";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase";
import appLogo from "../assets/images/appImage/app-logo.png";
const VAPID_KEY = "BHNa2kymQm9Gqeppv52AG9vRyZYYs5XxiJxsQx3kfrPzsYqUyvr9AhptExV59XpkAhK1nYlaP0pINs_FBLogACs"; // Firebase Console → Cloud Messaging → Web Push certificates

// ── FCM registration utility ──────────────────────────────────────────────────
export const registerFCMToken = async (email) => {
  try {
    if (!("Notification" in window))    return; // browser doesn't support
    if (!("serviceWorker" in navigator)) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
     console.log("Token : ",token);
    if (!token) return;

    // JWT cookie is already set at this point — backend can verify user
    await API.post("/user/saveFcmToken", { fcmToken: token , email });
    console.log("FCM token saved");

    // Handle foreground notifications (when tab is open)
    onMessage(messaging, (payload) => {
      if (Notification.permission === "granted") {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: appLogo,
        });
      }
    });
  } catch (error) {
    // Non-fatal — login still succeeds even if FCM fails
    console.warn("FCM registration failed:", error.message);
  }
};

// ── Login Component ───────────────────────────────────────────────────────────
export default function Login() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast,        setToast]        = useState("");
  const [loading,      setLoading]      = useState(false);

  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password)      return showToast("Please fill in all fields.");
    if (!email.includes("@"))     return showToast("Enter a valid email address.");
    if (password.length < 6)      return showToast("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await API.post("/user/login", { email, password });

      if (res.data.success) {
        // 1. Store user info
        localStorage.setItem("user", JSON.stringify(res.data.user));
        Cookies.set("user", JSON.stringify(res.data.user), {
          expires:  7,
          secure:   true,
          sameSite: "Strict",
        });

        showToast("Login successful 🎉");

        // 2. Register FCM token right after login (non-blocking)
        registerFCMToken(email);

        // 3. Navigate
        navigate("/user/dashboard");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => showToast("Connecting to Google...");

  return (
    <div className="min-h-screen bg-[#0E1320] flex items-center justify-center px-6 py-10">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-[#1e2a45] text-white text-sm px-5 py-2.5 rounded-full border border-white/10 z-50 whitespace-nowrap">
          {toast}
        </div>
      )}

      <div className="w-full max-w-[420px]">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-2xl mx-auto mb-3">
            🛍️
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to continue shopping</p>
        </div>

        {/* Card */}
        <div className="bg-[#141927] border border-white/[0.07] rounded-[20px] p-8">

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/85 text-sm font-semibold hover:bg-white/[0.08] hover:border-white/20 transition-all mb-5"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[11px] text-white/30 uppercase tracking-widest">or sign in with email</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-600 focus:bg-purple-600/[0.08] focus:ring-2 focus:ring-purple-600/20 transition-all"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 pr-11 text-sm text-white placeholder-white/20 outline-none focus:border-purple-600 focus:bg-purple-600/[0.08] focus:ring-2 focus:ring-purple-600/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-purple-400 transition-colors"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Forgot */}
          <div className="text-right mb-5">
            <Link to="/forgot-password" className="text-xs text-purple-400 font-medium hover:text-purple-300">
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white font-bold text-[15px] tracking-wide hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:from-purple-700 hover:to-purple-600 active:scale-[0.98] transition-all mb-5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? "Signing in…" : "Sign In"}
          </button>

          {/* Register */}
          <p className="text-center text-[13px] text-white/35">
            Don't have an account?
            <Link to="/register" className="text-purple-400 font-semibold ml-1 hover:text-purple-300">
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}