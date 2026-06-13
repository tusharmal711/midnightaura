import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api";
import Cookies from "js-cookie";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "../config/firebase";
import { GoogleLogin } from "@react-oauth/google";
import appLogo from "../assets/images/appImage/chomoktomok-logo.png";

const VAPID_KEY =
  "BHNa2kymQm9Gqeppv52AG9vRyZYYs5XxiJxsQx3kfrPzsYqUyvr9AhptExV59XpkAhK1nYlaP0pINs_FBLogACs";

// ── FCM registration utility ──────────────────────────────────────────────────
export const registerFCMToken = async (email) => {
  try {
    if (!("Notification" in window))     return;
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

    if (!token) return;

    await API.post("/user/saveFcmToken", { fcmToken: token, email });
    localStorage.setItem("fcmToken", token);

    onMessage(messaging, (payload) => {
      if (Notification.permission === "granted") {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: appLogo,
        });
      }
    });
  } catch (error) {
    console.warn("FCM registration failed:", error.message);
  }
};

// ── Login Component ───────────────────────────────────────────────────────────
export default function Login() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast,        setToast]        = useState({ msg: "", type: "info" });
  const [loading,      setLoading]      = useState(false);

  const navigate = useNavigate();

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "info" }), 2800);
  };

  // ── Save user to localStorage + Cookie ─────────────────────────────────────
  const persistUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    Cookies.set("user", JSON.stringify(userData), {
      expires:  7,
      secure:   true,
      sameSite: "Strict",
    });
  };

  // ── Email / Password Login ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password)  return showToast("Please fill in all fields.");
    if (!email.includes("@")) return showToast("Enter a valid email address.");
    if (password.length < 6)  return showToast("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await API.post("/user/login", { email, password });

      if (res.data.success) {
        const userData = {
          ...res.data.user,
          accessToken: res.data.accessToken,
        };
        persistUser(userData);
        showToast("Login successful 🎉", "success");
        registerFCMToken(email);
        navigate("/user/dashboard");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Google Login (called by GoogleLogin component's onSuccess) ──────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      return showToast("Google sign-in failed. No credential received.");
    }

    setLoading(true);
    try {
      const res = await API.post("/user/googleLogin", {
        token: credentialResponse.credential,
      });

      if (res.data.success) {
        const userData = {
          ...res.data.user,
          accessToken: res.data.accessToken,
        };
        persistUser(userData);
        showToast("Google Login Successful 🎉", "success");
        registerFCMToken(res.data.user.email);
        navigate("/user/dashboard");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Google Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    showToast("Google sign-in was cancelled or failed.");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0E1320] flex items-center justify-center px-6 py-10">

      {/* Toast */}
      {toast.msg && (
        <div
          className={`fixed bottom-7 left-1/2 -translate-x-1/2 text-white text-sm px-5 py-2.5 rounded-full border z-50 whitespace-nowrap transition-all
            ${toast.type === "success"
              ? "bg-green-900/80 border-green-500/30"
              : "bg-[#1e2a45] border-white/10"
            }`}
        >
          {toast.msg}
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

          {/* Google Login — uses the SDK button so credential is always valid */}
          <div className="w-full flex justify-center mb-5">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="filled_black"
              shape="rectangular"
              size="large"
              text="continue_with"
              width="340"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[11px] text-white/30 uppercase tracking-widest">
              or sign in with email
            </span>
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
            <Link
              to="/forgot-password"
              className="text-xs text-purple-400 font-medium hover:text-purple-300"
            >
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
            <Link
              to="/register"
              className="text-purple-400 font-semibold ml-1 hover:text-purple-300"
            >
              Create one
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}