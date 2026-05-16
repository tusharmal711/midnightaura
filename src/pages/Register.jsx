import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";
import { API } from "../api";
export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };




const handleRegister = async (e) => {
  e.preventDefault();

  if (!username || !email || !password)
      return showToast("Please fill in all fields.");
    if (!email.includes("@"))
      return showToast("Enter a valid email address.");
    if (password.length < 6)
      return showToast("Password must be at least 6 characters.");

  try {
    showToast("Creating your account...");

    const res = await API.post("/user/register", {
      firstName: username,   // backend firstName use korche
      lastName: "user",      // temporary
      email,
      password,
    });
    console.log(res);
    

    if (res.data.success) {
      showToast("Account created successfully 🎉");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }
  } catch (err) {
    showToast(err.response?.data?.message || "Registration failed");
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
          <h1 className="text-white text-xl font-bold tracking-tight">Create account</h1>
          <p className="text-white/40 text-sm mt-1">Sign up to start shopping</p>
        </div>

        {/* Card */}
        <div className="bg-[#141927] border border-white/[0.07] rounded-[20px] p-8">

          {/* Google */}
        

          

          {/* Username */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-white/50 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your username"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-600 focus:bg-purple-600/[0.08] focus:ring-2 focus:ring-purple-600/20 transition-all"
            />
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

              {/* Eye icon */}
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
            onClick={handleRegister}
            className="w-full py-3 mt-4 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 text-white font-bold text-[15px] tracking-wide hover:shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:from-purple-700 hover:to-purple-600 active:scale-[0.98] transition-all mb-5"
          >
            Sign Up
          </button>

          {/* Login link */}
          <p className="text-center text-[13px] text-white/35">
            Already have an account?
            <Link to="/login" className="text-purple-400 font-semibold ml-1 hover:text-purple-300">
              Login
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}