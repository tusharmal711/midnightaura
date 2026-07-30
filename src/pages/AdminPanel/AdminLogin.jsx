import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";
import { Helmet } from "react-helmet-async";

// ── Admin Login Component ─────────────────────────────────────────────────────
// Mirrors the styling of the user Login page. Admin signs in with email +
// password only (no Google/FCM). On success -> redirect to /admin/dashboard.
// On failure (email not found / wrong password) -> stay on page, show error.
export default function AdminLogin() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast,        setToast]        = useState({ msg: "", type: "error" });
  const [loading,      setLoading]      = useState(false);

  const navigate = useNavigate();

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "error" }), 2800);
  };

  // ── Persist a light "logged in" flag ───────────────────────────────────────
  // The real session lives in the httpOnly `adminToken` cookie the backend
  // sets — JS can't read that cookie (by design, it's XSS-safe), so there's
  // nothing meaningful to pull out of the response body to store alongside
  // it. We just remember the email for display purposes.
  const persistAdmin = (emailId) => {
    localStorage.setItem("admin", JSON.stringify({ emailId }));
  };

  // ── Email / Password Login ──────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password)  return showToast("Please fill in all fields.");
    if (!email.includes("@")) return showToast("Enter a valid email address.");
    if (password.length < 6)  return showToast("Password must be at least 6 characters.");

    setLoading(true);
    try {
      // NOTE: backend expects the key "emailId", not "email".
      const res = await API.post(
        "/admin/login",
        { emailId: email, password },
        { withCredentials: true } // required so the httpOnly adminToken cookie is accepted
      );

      if (res.data.success) {
        persistAdmin(email);
        showToast("Login successful 🎉", "success");
        navigate("/admin/dashboard");
      } else {
        // Defensive fallback in case the API resolves without throwing
        // but still signals failure (e.g. wrong password / no such admin).
        showToast(res.data.error || res.data.message || "Invalid credentials.");
      }
    } catch (err) {
      // Backend returns errors as { error: "Invalid Credentials" }, not "message".
      showToast(err.response?.data?.error || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0E1320] flex items-center justify-center px-6 py-10">
      <Helmet>
        <title>Admin Login | ChomokTomok</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

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
            🛡️
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to manage ChomokTomok</p>
        </div>

        {/* Card */}
        <form onSubmit={handleLogin} className="bg-[#141927] border border-white/[0.07] rounded-[20px] p-8">

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="username"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-600 focus:bg-purple-600/[0.08] focus:ring-2 focus:ring-purple-600/20 transition-all"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white font-bold text-[15px] tracking-wide hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:from-purple-700 hover:to-purple-600 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            )}
            {loading ? "Signing in…" : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  );
}