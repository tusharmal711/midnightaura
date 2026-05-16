import React, { useState } from "react";
import toast from "react-hot-toast";
import { API } from "../api";
export default function ForgotPassword() {



  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  // SEND OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/user/forgotPassword", { email });

      toast.success(res.data.message);
      setStep(2);

    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending OTP");
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/user/verifyOtp", { otp });

      toast.success(res.data.message);
      setStep(3);

    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/user/resetPassword", { password });

      toast.success(res.data.message);

      // 🔥 redirect to login
      window.location.href = "/login";

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-[400px] border border-white/20">

        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Forgot Password 🔐
        </h1>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={sendOtp} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            />

            <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:scale-105 transition">
              Send OTP
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="Enter OTP"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            />

            <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:scale-105 transition">
              Verify OTP
            </button>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"
            />

            <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:scale-105 transition">
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};




