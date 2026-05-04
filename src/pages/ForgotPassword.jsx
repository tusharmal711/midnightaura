import { useState } from "react";
import { Link } from "react-router-dom";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) return showToast("Please enter your email.");
    if (!email.includes("@")) return showToast("Enter a valid email address.");

    showToast("Password reset link sent!");
    // 🔁 integrate backend here (send reset email)
  };

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
            🔐
          </div>
          <h1 className="text-white text-xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-white/40 text-sm mt-1">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#141927] border border-white/[0.07] rounded-[20px] p-8">

          {/* Email */}
          <div className="mb-5">
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

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white font-bold text-[15px] tracking-wide hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:from-purple-700 hover:to-purple-600 active:scale-[0.98] transition-all mb-5"
          >
            Send Reset Link
          </button>

          {/* Back to login */}
          <p className="text-center text-[13px] text-white/35">
            Remember your password?
            <Link
              to="/login"
              className="text-purple-400 font-semibold ml-1 hover:text-purple-300"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}