import { useState } from "react";
import { useEffect, useRef } from "react";

import { IoIosFlash }                               from "react-icons/io";
import { MdDiscount, MdDeliveryDining }             from "react-icons/md";
import {
  FiArrowLeft, FiCheck, FiChevronDown, FiChevronUp,
  FiTag, FiCreditCard, FiSmartphone, FiShoppingBag,
  FiX,
} from "react-icons/fi";
import {
  BsShieldLockFill, BsArrowReturnLeft,
  BsPatchCheckFill, BsTagFill, BsBank2,
} from "react-icons/bs";
import { RiSecurePaymentLine } from "react-icons/ri";
import { useNavigate }         from "react-router-dom";
import tshirt9 from "../../assets/images/products/tshirt9.png";
import gpayLogo from "../../assets/icons/gpayLogo.png";
import paytmLogo from "../../assets/icons/paytmLogo.png";
import phonepayLogo from "../../assets/icons/phonepayLogo.png";
// ── Static data ───────────────────────────────────────────────────────────────
const PRODUCT = {
  name:           "Canon PIXMA G3470 All-in-One Wi-Fi Ink Tank Colour Printer",
  image:          tshirt9,
  price:          8299,
  oldPrice:       12495,
  discountPct:    33,
  deliveryCharge: 0,
  badge:          "Best Seller",
};

const STEPS = ["Address", "Order Summary", "Payment"];
const fmt   = (n) => "₹" + Number(n).toLocaleString("en-IN");

// ── Stepper ───────────────────────────────────────────────────────────────────
const Stepper = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8 select-none">
    {STEPS.map((label, i) => {
      const done   = i < current;
      const active = i === current;
      return (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
              ${done   ? "bg-[#a078ff] border-[#a078ff] text-white shadow-[0_0_14px_rgba(160,120,255,0.55)]"
              : active ? "bg-transparent border-[#a078ff] text-[#a078ff] shadow-[0_0_10px_rgba(160,120,255,0.3)]"
              :          "bg-transparent border-[rgba(160,120,255,0.22)] text-[#8880aa]"}`}>
              {done ? <FiCheck size={14} /> : i + 1}
            </div>
            <span className={`text-[10px] tracking-widest uppercase
              ${active ? "text-[#a078ff]" : done ? "text-[#a078ff]/70" : "text-[#8880aa]"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-px mx-1 mb-4
              ${done ? "bg-[#a078ff]" : "bg-[rgba(160,120,255,0.18)]"}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ── Shared primitives ─────────────────────────────────────────────────────────
const Card     = ({ children, className = "" }) => (
  <div className={`bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-2xl px-5 py-4 ${className}`}>
    {children}
  </div>
);
const Divider  = () => <div className="h-px bg-[rgba(160,120,255,0.10)] my-3" />;
const SecLabel = ({ children }) => (
  <div className="text-[10px] tracking-[0.15em] uppercase text-[#8880aa] mb-2.5">{children}</div>
);
const FieldLabel = ({ children }) => (
  <div className="text-[10px] text-[#8880aa] uppercase tracking-widest mb-1">{children}</div>
);
const TextInput = ({ value, onChange, placeholder = "", type = "text", hasError = false, maxLength }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    maxLength={maxLength}
    className={`w-full bg-[#0E1320] border rounded-xl px-3 py-2.5 text-sm text-[#e8e0ff]
      placeholder-[#5a5478] transition-all outline-none
      focus:shadow-[0_0_10px_rgba(160,120,255,0.2)]
      ${hasError
        ? "border-red-500/60 focus:border-red-400"
        : "border-[rgba(160,120,255,0.25)] focus:border-[#a078ff]"}`}
  />
);

// ── Radio Option ──────────────────────────────────────────────────────────────
const RadioOption = ({ selected, onClick, icon, label, sublabel }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border transition-all text-left
      ${selected
        ? "border-[#a078ff] bg-[rgba(160,120,255,0.08)] shadow-[0_0_16px_rgba(160,120,255,0.15)]"
        : "border-[rgba(160,120,255,0.18)] hover:border-[rgba(160,120,255,0.4)] hover:bg-[rgba(160,120,255,0.04)]"}`}
  >
    {/* Custom radio dot */}
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
      ${selected ? "border-[#a078ff]" : "border-[rgba(160,120,255,0.35)]"}`}>
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#a078ff] shadow-[0_0_6px_rgba(160,120,255,0.8)]" />}
    </div>
    <div className={`text-xl shrink-0 ${selected ? "text-[#a078ff]" : "text-[#8880aa]"}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-semibold transition-colors ${selected ? "text-[#e8e0ff]" : "text-[#b8b0cc]"}`}
        style={{ fontFamily: "'Poppins', sans-serif" }}>
        {label}
      </div>
      {sublabel && (
        <div className="text-[11px] text-[#8880aa] mt-0.5">{sublabel}</div>
      )}
    </div>
    {selected && (
      <div className="shrink-0 w-6 h-6 rounded-full bg-[#a078ff] flex items-center justify-center shadow-[0_0_8px_rgba(160,120,255,0.5)]">
        <FiCheck size={12} className="text-white" />
      </div>
    )}
  </button>
);

// ── Sub Option (card / upi) ───────────────────────────────────────────────────
const SubOption = ({ selected, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border transition-all
      ${selected
        ? "border-[#a078ff] bg-[rgba(160,120,255,0.1)] shadow-[0_0_12px_rgba(160,120,255,0.2)]"
        : "border-[rgba(160,120,255,0.15)] hover:border-[rgba(160,120,255,0.35)] hover:bg-[rgba(160,120,255,0.04)]"}`}
  >
    <div className={`text-2xl transition-colors ${selected ? "text-[#a078ff]" : "text-[#8880aa]"}`}>{icon}</div>
    <div className={`text-[11px] font-semibold tracking-wide transition-colors ${selected ? "text-[#e8e0ff]" : "text-[#8880aa]"}`}
      style={{ fontFamily: "'Poppins', sans-serif" }}>
      {label}
    </div>
    {selected && (
      <div className="w-1.5 h-1.5 rounded-full bg-[#a078ff] shadow-[0_0_4px_rgba(160,120,255,0.9)]" />
    )}
  </button>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function ViewPayment() {
  const navigate = useNavigate();

  // payment mode: "offline" | "online"
  const [mode,       setMode]       = useState("offline");
  // online sub-mode: "card" | "upi"
  const [onlineMode, setOnlineMode] = useState("card");
  const [feesOpen,   setFeesOpen]   = useState(false);
  const [placing,    setPlacing]    = useState(false);
  const [success,    setSuccess]    = useState(false);

  // Card fields
  const [cardNum,  setCardNum]  = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp,  setCardExp]  = useState("");
  const [cardCvv,  setCardCvv]  = useState("");
  const [cardErr,  setCardErr]  = useState({});

  // UPI field
  const [upiId,  setUpiId]  = useState("");
  const [upiErr, setUpiErr] = useState(false);

  const subtotal = PRODUCT.price;
  const delivery = PRODUCT.deliveryCharge;
  const total    = subtotal + delivery;
  const saved    = PRODUCT.oldPrice - PRODUCT.price;

  // Card number formatter  xxxx xxxx xxxx xxxx
  const formatCard = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  // Expiry formatter  MM/YY
  const formatExp = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const validateCard = () => {
    const errs = {};
    if (cardNum.replace(/\s/g, "").length < 16) errs.num = true;
    if (!cardName.trim()) errs.name = true;
    if (cardExp.length < 5) errs.exp = true;
    if (cardCvv.length < 3) errs.cvv = true;
    setCardErr(errs);
    return Object.keys(errs).length === 0;
  };

  const validateUpi = () => {
    const ok = /^[\w.\-+]+@[\w]+$/.test(upiId.trim());
    setUpiErr(!ok);
    return ok;
  };

  const handlePay = () => {
    if (mode === "online") {
      if (onlineMode === "card" && !validateCard()) return;
      if (onlineMode === "upi"  && !validateUpi())  return;
    }
    setPlacing(true);
    setTimeout(() => { setPlacing(false); setSuccess(true); }, 1800);
  };

  // ── Success overlay ──
  function CelebrationCanvas() {
    const canvasRef = useRef(null);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const parent = canvas.parentElement;
  
      const resize = () => {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(parent);
  
      const COLORS = ["#a078ff","#FFE51F","#ff6b9d","#00e5ff","#ff9f43","#54a0ff","#ffd32a","#ff4757","#7bed9f"];
  
      class Particle {
        constructor(x, y, burst) {
          this.x = x; this.y = y; this.burst = burst;
          const angle = Math.random() * Math.PI * 2;
          const speed = burst ? 4 + Math.random() * 10 : 1 + Math.random() * 3;
          this.vx = Math.cos(angle) * speed * (burst ? 1 : 0.5);
          this.vy = Math.sin(angle) * speed * (burst ? -1 : -0.5) - (burst ? 2 : 1);
          this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
          this.size = burst ? 6 + Math.random() * 8 : 4 + Math.random() * 6;
          this.life = 1;
          this.decay = burst ? 0.012 + Math.random() * 0.018 : 0.008 + Math.random() * 0.012;
          this.rot = Math.random() * 360;
          this.rotV = (Math.random() - 0.5) * 8;
          this.shape = Math.random() < 0.5 ? "rect" : "circle";
          this.gravity = 0.18;
        }
        update() {
          this.vy += this.gravity;
          this.x += this.vx; this.y += this.vy;
          this.vx *= 0.98; this.life -= this.decay;
          this.rot += this.rotV;
        }
        draw(ctx) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, this.life);
          ctx.fillStyle = this.color;
          ctx.translate(this.x, this.y);
          ctx.rotate((this.rot * Math.PI) / 180);
          if (this.shape === "circle") {
            ctx.beginPath(); ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2); ctx.fill();
          } else {
            ctx.fillRect(-this.size / 2, -this.size / 3, this.size, this.size * 0.6);
          }
          ctx.restore();
        }
      }
  
      let particles = [];
      let animId;
  
      const burst = (x, y, n = 60) => {
        for (let i = 0; i < n; i++) particles.push(new Particle(x, y, true));
      };
  
      const loop = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // gentle rain
        for (let i = 0; i < 4; i++)
          particles.push(new Particle(Math.random() * canvas.width, -10, false));
        particles = particles.filter((p) => p.life > 0);
        particles.forEach((p) => { p.update(); p.draw(ctx); });
        animId = requestAnimationFrame(loop);
      };
  
      const cx = canvas.width / 2, cy = canvas.height / 2;
      setTimeout(() => {
        burst(cx, cy, 80);
        burst(cx - 80, cy + 40, 40);
        burst(cx + 80, cy + 40, 40);
        setTimeout(() => burst(cx, cy - 30, 50), 300);
        setTimeout(() => { burst(cx - 60, cy, 30); burst(cx + 60, cy, 30); }, 500);
      }, 200);
  
      loop();
  
      return () => {
        cancelAnimationFrame(animId);
        ro.disconnect();
      };
    }, []);
  
    return (
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    );
  }
 if (success) {
   return (
     <>
       <link rel="preconnect" href="https://fonts.googleapis.com" />
       <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
       <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
       <style>{`* { box-sizing: border-box; } body { margin: 0; } input { outline: none; }`}</style>
       <div
         className="min-h-screen bg-[#0E1320] flex items-center justify-center px-4 relative overflow-hidden"
         style={{ fontFamily: "'Raleway', sans-serif" }}
       >
         <CelebrationCanvas />
         <div className="text-center flex flex-col items-center gap-4 max-w-xs relative z-10">
           <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#a078ff] to-[#7c3aed] flex items-center justify-center"
             style={{ animation: "pulse-glow 1.4s ease-in-out infinite", boxShadow: "0 0 40px rgba(160,120,255,0.5)" }}>
             <FiCheck size={36} className="text-white" />
           </div>
           <h2 className="text-2xl font-bold text-[#e8e0ff]" style={{ fontFamily: "'Cinzel', serif" }}>Order Placed!</h2>
           <p className="text-sm text-[#8880aa] leading-relaxed">
             Your order has been successfully placed.<br />
             You'll receive a confirmation shortly.
           </p>
           <button
             onClick={() => navigate("/user/dashboard")}
             className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-br from-[#FFE51F] to-[#FFD600] text-[#111827] text-sm font-bold flex items-center gap-2"
             style={{ fontFamily: "'Poppins', sans-serif", boxShadow: "0 0 20px rgba(255,229,31,0.35)" }}
           >
             <FiShoppingBag size={16} /> Continue Shopping
           </button>
         </div>
       </div>
     </>
   );
 }
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0E1320; }
        ::-webkit-scrollbar-thumb { background: rgba(160,120,255,0.28); border-radius: 4px; }
        .cinzel { font-family: 'Cinzel', serif; }
        body { margin: 0; }
        input { outline: none; }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(160,120,255,0.5); }
          70%  { box-shadow: 0 0 0 10px rgba(160,120,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(160,120,255,0); }
        }
        .pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .spin-slow { animation: spin-slow 1s linear infinite; }
      `}</style>

      <div className="min-h-screen bg-[#0E1320] text-[#e8e0ff] pb-32 lg:pb-12" style={{ fontFamily: "'Raleway', sans-serif" }}>

      
       

        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Stepper current={2} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ════════════ LEFT ════════════ */}
            <div className="flex flex-col gap-5">

              {/* ── Payment Mode ── */}
              <Card>
                <SecLabel>Select Payment Mode</SecLabel>
                <div className="flex flex-col gap-3">

                  {/* Offline / COD */}
                  <RadioOption
                    selected={mode === "offline"}
                    onClick={() => setMode("offline")}
                    icon={<FiShoppingBag size={20} />}
                    label="Cash on Delivery (Offline)"
                    sublabel="Pay in cash when your order is delivered"
                  />

                  {/* Online */}
                  <RadioOption
                    selected={mode === "online"}
                    onClick={() => setMode("online")}
                    icon={<RiSecurePaymentLine size={20} />}
                    label="Pay Online"
                    sublabel="Card, UPI, Net Banking & more"
                  />
                </div>

                {/* ── Online sub-options ── */}
                {mode === "online" && (
                  <div className="mt-4">
                    <Divider />
                    <div className="flex gap-3 mt-3 mb-4">
                      <SubOption
                        selected={onlineMode === "card"}
                        onClick={() => setOnlineMode("card")}
                        icon={<FiCreditCard />}
                        label="Card"
                      />
                      <SubOption
                        selected={onlineMode === "upi"}
                        onClick={() => setOnlineMode("upi")}
                        icon={<FiSmartphone />}
                        label="UPI"
                      />
                    </div>

                    {/* ── Card Form ── */}
                    {onlineMode === "card" && (
                      <div className="flex flex-col gap-3.5">
                        <div className="flex items-center gap-2 mb-1">
                          <FiCreditCard size={14} className="text-[#a078ff]" />
                          <span className="text-xs text-[#8880aa] uppercase tracking-widest">Credit / Debit / ATM Card</span>
                        </div>

                        {/* Card visual preview */}
                        <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-1"
                          style={{ background: "linear-gradient(135deg,#2a1a5e,#1a0a3e,#0e0628)" }}>
                          <div className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: "radial-gradient(circle at 80% 20%,rgba(160,120,255,0.6) 0%,transparent 50%),radial-gradient(circle at 20% 80%,rgba(100,60,200,0.4) 0%,transparent 50%)" }} />
                          <div className="absolute top-4 left-5 right-5 flex justify-between items-start">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-[#a078ff]/70">Secured Card</div>
                            <BsShieldLockFill size={18} className="text-[#a078ff]/60" />
                          </div>
                          <div className="absolute bottom-4 left-5 right-5">
                            <div className="text-base font-mono tracking-[0.15em] text-[#e8e0ff] mb-2">
                              {cardNum || "•••• •••• •••• ••••"}
                            </div>
                            <div className="flex justify-between items-end">
                              <div>
                                <div className="text-[8px] text-[#8880aa] uppercase tracking-widest">Card Holder</div>
                                <div className="text-xs text-[#e8e0ff] font-medium">{cardName || "YOUR NAME"}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-[8px] text-[#8880aa] uppercase tracking-widest">Expires</div>
                                <div className="text-xs text-[#e8e0ff] font-medium">{cardExp || "MM/YY"}</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card number */}
                        <div>
                          <FieldLabel>Card Number</FieldLabel>
                          <TextInput
                            type="tel"
                            value={cardNum}
                            onChange={(e) => setCardNum(formatCard(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            hasError={cardErr.num}
                            maxLength={19}
                          />
                          {cardErr.num && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><FiX size={11} />Enter a valid 16-digit card number</p>}
                        </div>

                        {/* Name */}
                        <div>
                          <FieldLabel>Name on Card</FieldLabel>
                          <TextInput
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                            placeholder="As printed on card"
                            hasError={cardErr.name}
                          />
                          {cardErr.name && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><FiX size={11} />Please enter the cardholder name</p>}
                        </div>

                        {/* Expiry + CVV row */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <FieldLabel>Expiry (MM/YY)</FieldLabel>
                            <TextInput
                              type="tel"
                              value={cardExp}
                              onChange={(e) => setCardExp(formatExp(e.target.value))}
                              placeholder="MM/YY"
                              hasError={cardErr.exp}
                              maxLength={5}
                            />
                            {cardErr.exp && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><FiX size={11} />Invalid expiry</p>}
                          </div>
                          <div>
                            <FieldLabel>CVV</FieldLabel>
                            <TextInput
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              placeholder="•••"
                              hasError={cardErr.cvv}
                              maxLength={4}
                            />
                            {cardErr.cvv && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><FiX size={11} />Invalid CVV</p>}
                          </div>
                        </div>

                        {/* RBI note */}
                        <div className="flex items-start gap-2 bg-[rgba(160,120,255,0.06)] border border-[rgba(160,120,255,0.12)] rounded-xl px-3 py-2.5 text-[11px] text-[#8880aa] leading-relaxed">
                          <BsShieldLockFill size={13} className="text-[#a078ff] shrink-0 mt-0.5" />
                          Cards are secured and stored as per RBI guidelines. Your CVV is never stored.
                        </div>
                      </div>
                    )}

                    {/* ── UPI Form ── */}
                    {onlineMode === "upi" && (
                      <div className="flex flex-col gap-3.5">
                        <div className="flex items-center gap-2 mb-1">
                          <FiSmartphone size={14} className="text-[#a078ff]" />
                          <span className="text-xs text-[#8880aa] uppercase tracking-widest">UPI Payment</span>
                        </div>

                        {/* UPI illustration */}
                        {/* UPI illustration */}
                        <div className="flex items-center justify-center gap-4 py-4 bg-[rgba(160,120,255,0.05)] border border-[rgba(160,120,255,0.1)] rounded-xl mb-1">

                          {[
                            {
                              name: "GPay",
                              icon: gpayLogo,
                            },
                            {
                              name: "PhonePe",
                              icon: phonepayLogo,
                            },
                            {
                              name: "Paytm",
                              icon: paytmLogo,
                            },
                            
                          ].map((app) => (
                            <div key={app.name} className="flex flex-col items-center gap-1.5">

                              <div className="w-10 h-10 rounded-xl bg-white border border-[rgba(160,120,255,0.2)] flex items-center justify-center overflow-hidden p-1">

                                <img
                                  src={app.icon}
                                  alt={app.name}
                                  className="w-full h-full object-contain"
                                />

                              </div>

                              <span className="text-[9px] text-[#8880aa]">
                                {app.name}
                              </span>

                            </div>
                          ))}

                        </div>

                        <div>
                          <FieldLabel>Enter UPI ID</FieldLabel>
                          <TextInput
                            value={upiId}
                            onChange={(e) => { setUpiId(e.target.value); setUpiErr(false); }}
                            placeholder="yourname@upi  (e.g. tushar@okicici)"
                            hasError={upiErr}
                          />
                          {upiErr && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><FiX size={11} />Enter a valid UPI ID (e.g. name@bank)</p>}
                        </div>

                        <div className="flex items-start gap-2 bg-[rgba(160,120,255,0.06)] border border-[rgba(160,120,255,0.12)] rounded-xl px-3 py-2.5 text-[11px] text-[#8880aa] leading-relaxed">
                          <BsShieldLockFill size={13} className="text-[#a078ff] shrink-0 mt-0.5" />
                          You'll receive a payment request on your UPI app. Approve it to complete the order.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* COD note */}
                {mode === "offline" && (
                  <div className="mt-4 flex items-start gap-2 bg-[rgba(160,120,255,0.06)] border border-[rgba(160,120,255,0.12)] rounded-xl px-3 py-2.5 text-[11px] text-[#8880aa] leading-relaxed">
                    <FiShoppingBag size={13} className="text-[#a078ff] shrink-0 mt-0.5" />
                    Keep the exact amount ready at the time of delivery. Our delivery partner accepts cash only.
                  </div>
                )}
              </Card>

              {/* ── Order Item mini recap ── */}
              <Card>
                <SecLabel>Order Item</SecLabel>
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl bg-[#0E1320] border border-[rgba(160,120,255,0.18)] flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={PRODUCT.image} alt={PRODUCT.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#e8e0ff] line-clamp-1 leading-snug"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {PRODUCT.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-base font-bold text-[#17ec03]">{fmt(PRODUCT.price)}</span>
                      <span className="text-xs text-[#8880aa] line-through">{fmt(PRODUCT.oldPrice)}</span>
                      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <MdDiscount size={10} /> {PRODUCT.discountPct}% OFF
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

            </div>
            {/* ════════════ END LEFT ════════════ */}

            {/* ════════════ RIGHT ════════════ */}
            <div className="lg:sticky lg:top-20 flex flex-col gap-4">
              <Card>
                <SecLabel>Price Summary</SecLabel>
                <div className="flex flex-col gap-3 text-sm">

                  <div className="flex justify-between items-center">
                    <span className="text-[#8880aa]">MRP</span>
                    <span className="text-[#e8e0ff] font-medium">{fmt(PRODUCT.oldPrice)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#8880aa] flex items-center gap-1">
                      <MdDiscount size={13} className="text-green-400" />
                      Discount ({PRODUCT.discountPct}%)
                    </span>
                    <span className="text-green-400 font-semibold">− {fmt(saved)}</span>
                  </div>

                  {/* Delivery & Fees expandable */}
                  <div>
                    <button
                      onClick={() => setFeesOpen((p) => !p)}
                      className="flex justify-between items-center w-full text-[#8880aa] hover:text-[#e8e0ff] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <MdDeliveryDining size={14} />
                        Delivery &amp; Fees
                        {feesOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                      </span>
                      <span className="text-green-400 font-semibold">FREE</span>
                    </button>
                    {feesOpen && (
                      <div className="mt-2 bg-[#0E1320] border border-[rgba(160,120,255,0.13)] rounded-xl px-3 py-2.5 text-xs text-[#8880aa] leading-relaxed">
                        <div className="flex justify-between mb-1">
                          <span>Shipping</span>
                          <span className="text-green-400">FREE</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform fee</span>
                          <span>₹0</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Divider />

                  <div className="flex justify-between items-center">
                    <span className="text-[#e8e0ff] font-semibold text-base">Total Amount</span>
                    <span className="cinzel text-xl font-bold text-[#17ec03]">{fmt(total)}</span>
                  </div>

                  {saved > 0 && (
                    <div className="flex items-center justify-center gap-1 text-xs text-green-400 bg-green-400/10 rounded-lg py-2">
                      <FiTag size={11} /> You save {fmt(saved)} on this order!
                    </div>
                  )}
                </div>
              </Card>

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={placing}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl
                  bg-gradient-to-br from-[#FFE51F] to-[#FFD600]
                  text-[#111827] text-base font-bold tracking-wide
                  shadow-[0_0_24px_rgba(255,229,31,0.35)]
                  hover:shadow-[0_0_36px_rgba(255,229,31,0.55)]
                  hover:-translate-y-[1px] transition-all duration-300
                  disabled:opacity-70 disabled:cursor-wait disabled:translate-y-0`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {placing ? (
                  <>
                    <svg className="spin-slow w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Processing…
                  </>
                ) : (
                  <>
                    <IoIosFlash size={22} />
                    {mode === "offline" ? `Confirm Order · ${fmt(total)}` : `Pay ${fmt(total)}`}
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: <BsShieldLockFill  size={18} className="text-[#a078ff]" />, label: "Secure Payment" },
                  { icon: <BsArrowReturnLeft size={18} className="text-[#a078ff]" />, label: "Easy Returns"   },
                  { icon: <BsPatchCheckFill  size={18} className="text-[#a078ff]" />, label: "Verified Seller"},
                ].map((b, i) => (
                  <div key={i} className="bg-[#12121a] border border-[rgba(160,120,255,0.10)] rounded-xl py-2.5 flex flex-col items-center gap-1.5">
                    {b.icon}
                    <span className="text-[9px] text-[#8880aa] leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* ════════════ END RIGHT ════════════ */}

          </div>
        </div>

        {/* ── Mobile sticky bottom bar ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 bg-[#0E1320]/95 backdrop-blur border-t border-[rgba(160,120,255,0.12)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] text-[#8880aa] uppercase tracking-widest">Total</div>
              <div className="cinzel text-lg font-bold text-[#17ec03]">{fmt(total)}</div>
            </div>
            {saved > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
                <FiTag size={11} /> Save {fmt(saved)}
              </div>
            )}
          </div>
          <button
            onClick={handlePay}
            disabled={placing}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
              bg-gradient-to-br from-[#FFE51F] to-[#FFD600]
              text-[#111827] text-sm font-bold tracking-wide
              shadow-[0_0_20px_rgba(255,229,31,0.35)]
              hover:shadow-[0_0_30px_rgba(255,229,31,0.55)]
              transition-all duration-300 disabled:opacity-70 disabled:cursor-wait"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {placing ? "Processing…" : (
              <><IoIosFlash size={20} /> {mode === "offline" ? `Confirm Order · ${fmt(total)}` : `Pay ${fmt(total)}`}</>
            )}
          </button>
        </div>

      </div>
    </>
  );
}