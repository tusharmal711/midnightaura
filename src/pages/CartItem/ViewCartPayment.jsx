// pages/ViewCartPayment.jsx
import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { IoIosFlash }               from "react-icons/io";
import { MdDiscount, MdDeliveryDining } from "react-icons/md";
import { Helmet } from "react-helmet-async";
import {
  FiCheck, FiChevronDown, FiChevronUp,
  FiTag, FiCreditCard, FiSmartphone, FiShoppingBag, FiX,
} from "react-icons/fi";
import { BsShieldLockFill, BsArrowReturnLeft, BsPatchCheckFill } from "react-icons/bs";
import { RiSecurePaymentLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";
import gpayLogo     from "../../assets/icons/gpayLogo.png";
import paytmLogo    from "../../assets/icons/paytmLogo.png";
import phonepayLogo from "../../assets/icons/phonepayLogo.png";

const BASE_URL = "https://midnightaura-1.onrender.com";
const STEPS    = ["Address", "Order Summary", "Payment"];
const fmt      = (n) => "₹" + Number(n).toLocaleString("en-IN");
const imgUrl   = (path) => !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/")?"":"/"}${path}`;
const calcDelivery = (totalItems) => {
  if (totalItems === 1) return 30;
  return 40;
};
function getStoredEmail() {
  try { const s = localStorage.getItem("user"); if (s) { const p=JSON.parse(s); if (p?.email) return p.email; } } catch(_) {}
  try { const c = Cookies.get("user"); if (c) { const p=JSON.parse(c); if (p?.email) return p.email; } } catch(_) {}
  return null;
}

// ── Stepper ───────────────────────────────────────────────────────────────────
const Stepper = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8 select-none">
    {STEPS.map((label, i) => {
      const done=i<current, active=i===current;
      return (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${done?"bg-[#a078ff] border-[#a078ff] text-white shadow-[0_0_14px_rgba(160,120,255,0.55)]":active?"bg-transparent border-[#a078ff] text-[#a078ff] shadow-[0_0_10px_rgba(160,120,255,0.3)]":"bg-transparent border-[rgba(160,120,255,0.22)] text-[#8880aa]"}`}>
              {done ? <FiCheck size={14}/> : i+1}
            </div>
            <span className={`text-[10px] tracking-widest uppercase ${active?"text-[#a078ff]":done?"text-[#a078ff]/70":"text-[#8880aa]"}`}>{label}</span>
          </div>
          {i < STEPS.length-1 && <div className={`w-16 sm:w-24 h-px mx-1 mb-4 ${done?"bg-[#a078ff]":"bg-[rgba(160,120,255,0.18)]"}`}/>}
        </div>
      );
    })}
  </div>
);

const Card      = ({ children, className="" }) => <div className={`bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-2xl px-5 py-4 ${className}`}>{children}</div>;
const Divider   = () => <div className="h-px bg-[rgba(160,120,255,0.10)] my-3"/>;
const SecLabel  = ({ children }) => <div className="text-[10px] tracking-[0.15em] uppercase text-[#8880aa] mb-2.5">{children}</div>;
const FieldLabel= ({ children }) => <div className="text-[10px] text-[#8880aa] uppercase tracking-widest mb-1">{children}</div>;

const TextInput = ({ value, onChange, placeholder="", type="text", hasError=false, maxLength }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
    className={`w-full bg-[#0E1320] border rounded-xl px-3 py-2.5 text-sm text-[#e8e0ff] placeholder-[#5a5478] outline-none focus:shadow-[0_0_10px_rgba(160,120,255,0.2)] ${hasError?"border-red-500/60 focus:border-red-400":"border-[rgba(160,120,255,0.25)] focus:border-[#a078ff]"}`}
  />
);

const RadioOption = ({ selected, onClick, icon, label, sublabel }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border transition-all text-left ${selected?"border-[#a078ff] bg-[rgba(160,120,255,0.08)] shadow-[0_0_16px_rgba(160,120,255,0.15)]":"border-[rgba(160,120,255,0.18)] hover:border-[rgba(160,120,255,0.4)]"}`}>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected?"border-[#a078ff]":"border-[rgba(160,120,255,0.35)]"}`}>
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#a078ff] shadow-[0_0_6px_rgba(160,120,255,0.8)]"/>}
    </div>
    <div className={`text-xl shrink-0 ${selected?"text-[#a078ff]":"text-[#8880aa]"}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <div className={`text-sm font-semibold ${selected?"text-[#e8e0ff]":"text-[#b8b0cc]"}`} style={{ fontFamily:"'Poppins',sans-serif" }}>{label}</div>
      {sublabel && <div className="text-[11px] text-[#8880aa] mt-0.5">{sublabel}</div>}
    </div>
    {selected && <div className="shrink-0 w-6 h-6 rounded-full bg-[#a078ff] flex items-center justify-center shadow-[0_0_8px_rgba(160,120,255,0.5)]"><FiCheck size={12} className="text-white"/></div>}
  </button>
);

const SubOption = ({ selected, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border transition-all ${selected?"border-[#a078ff] bg-[rgba(160,120,255,0.1)] shadow-[0_0_12px_rgba(160,120,255,0.2)]":"border-[rgba(160,120,255,0.15)] hover:border-[rgba(160,120,255,0.35)]"}`}>
    <div className={`text-2xl ${selected?"text-[#a078ff]":"text-[#8880aa]"}`}>{icon}</div>
    <div className={`text-[11px] font-semibold tracking-wide ${selected?"text-[#e8e0ff]":"text-[#8880aa]"}`} style={{ fontFamily:"'Poppins',sans-serif" }}>{label}</div>
    {selected && <div className="w-1.5 h-1.5 rounded-full bg-[#a078ff] shadow-[0_0_4px_rgba(160,120,255,0.9)]"/>}
  </button>
);

function SkeletonCard({ rows=3 }) {
  const sh = { background:"linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)", backgroundSize:"600px 100%", animation:"sk-shimmer 1.4s infinite linear", borderRadius:8 };
  return (
    <div className="bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-2xl px-5 py-4">
      <div style={{ ...sh, height:10, width:"30%", marginBottom:18 }}/>
      {Array.from({ length:rows }).map((_,i) => (
        <div key={i} style={{ display:"flex", gap:10, marginBottom:14 }}>
          <div style={{ ...sh, width:52, height:52, borderRadius:12, flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <div style={{ ...sh, height:9, width:"70%", marginBottom:10 }}/>
            <div style={{ ...sh, height:13, width:"40%" }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ViewCartPayment() {
  const navigate = useNavigate();

  // Voucher from sessionStorage (set in ViewCartCheckout)
  const appliedVoucherId    = sessionStorage.getItem("cartAppliedVoucherId")    || null;
  const appliedVoucherLabel = sessionStorage.getItem("cartAppliedVoucherLabel") || null;
  const appliedVoucherValue = Number(sessionStorage.getItem("cartAppliedVoucherValue") || "0");
  const hasVoucher          = !!appliedVoucherId && appliedVoucherValue > 0;

  const [customerId,  setCustomerId]  = useState(null);
  const [userEmail,   setUserEmail]   = useState(null);
  const [cartItems,   setCartItems]   = useState([]);
  const [cartLoading, setCartLoading] = useState(true);

  const [mode,       setMode]       = useState("offline");
  const [onlineMode, setOnlineMode] = useState("card");
  const [feesOpen,   setFeesOpen]   = useState(false);
  const [placing,    setPlacing]    = useState(false);
  const [orderErr,   setOrderErr]   = useState("");

  // Card fields
  const [cardNum,  setCardNum]  = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp,  setCardExp]  = useState("");
  const [cardCvv,  setCardCvv]  = useState("");
  const [cardErr,  setCardErr]  = useState({});
  const [upiId,    setUpiId]    = useState("");
  const [upiErr,   setUpiErr]   = useState(false);

  const payBtnRef = useRef(null);
  const [fixedBar, setFixedBar] = useState(false);

  useEffect(() => {
    const check = () => {
      if (!payBtnRef.current) return;
      const r = payBtnRef.current.getBoundingClientRect();
      setFixedBar(r.bottom < 0 || r.top > window.innerHeight);
    };
    check();
    window.addEventListener("scroll", check, { passive:true });
    return () => window.removeEventListener("scroll", check);
  }, [cartLoading]);

  // ── Load profile + cart ───────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const email = getStoredEmail();
        if (!email) return;
        setUserEmail(email);
        const res = await API.post("/user/getProfile", { email });
        if (res.data.success) {
          const cid = res.data.user?.customerId || null;
          setCustomerId(cid);
          if (cid) {
            const cartRes = await API.get(`/cart/getCart/${cid}`);
            if (cartRes.data.success) setCartItems(cartRes.data.data || []);
          }
        }
      } catch (err) {
        console.error("init error:", err);
      } finally {
        setCartLoading(false);
      }
    };
    init();
  }, []);

  // ── Derived prices ────────────────────────────────────────────────────────
  let subtotal = 0, mrpTotal = 0, totalDiscount = 0;
  cartItems.forEach((item) => {
    const price = item.product?.finalPrice || 0;
    const mrp   = item.product?.mrp        || 0;
    subtotal     += price * item.quantity;
    mrpTotal     += mrp   * item.quantity;
    totalDiscount += (mrp - price) * item.quantity;
  });
  const voucherDiscountAmt =
  hasVoucher
    ? Math.round(subtotal * (appliedVoucherValue / 100))
    : 0;

const afterVoucher = subtotal - voucherDiscountAmt;

// number of products in cart
const totalItems = cartItems.length;

const deliveryCharge = calcDelivery(totalItems);

const total = afterVoucher + deliveryCharge;
  const totalSaved         = totalDiscount + voucherDiscountAmt;

  // ── Card helpers ──────────────────────────────────────────────────────────
  const formatCard = (v) => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExp  = (v) => { const d=v.replace(/\D/g,"").slice(0,4); return d.length>2 ? d.slice(0,2)+"/"+d.slice(2) : d; };
  const validateCard = () => {
    const errs = {};
    if (cardNum.replace(/\s/g,"").length < 16) errs.num  = true;
    if (!cardName.trim())                       errs.name = true;
    if (cardExp.length < 5)                     errs.exp  = true;
    if (cardCvv.length < 3)                     errs.cvv  = true;
    setCardErr(errs); return Object.keys(errs).length === 0;
  };
  const validateUpi = () => { const ok=/^[\w.\-+]+@[\w]+$/.test(upiId.trim()); setUpiErr(!ok); return ok; };

  // ── Consume voucher after successful order ────────────────────────────────
  const consumeVoucher = async (orderId) => {
    if (!hasVoucher || !userEmail) return;
    try {
      await API.post("/discount/consumeDiscount", { discountId:appliedVoucherId, userEmail, orderId });
      sessionStorage.removeItem("cartAppliedVoucherId");
      sessionStorage.removeItem("cartAppliedVoucherLabel");
      sessionStorage.removeItem("cartAppliedVoucherValue");
    } catch (err) {
      console.error("Voucher consume failed after cart order:", err);
    }
  };

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePay = async () => {
    setOrderErr("");
    if (mode === "online") {
      if (onlineMode === "card" && !validateCard()) return;
      if (onlineMode === "upi"  && !validateUpi())  return;
    }
    if (!customerId || cartItems.length === 0) {
      setOrderErr("Cart is empty or session expired. Please go back.");
      return;
    }
    setPlacing(true);
    try {
      const payMethodMap = { offline:"COD", card:"CARD", upi:"UPI" };
      const payMethod    = mode === "offline" ? "COD" : payMethodMap[onlineMode];

      const items = cartItems.map((item) => ({
        productId: item.product?.productId || item.productId,
        size:      item.size || null,
        quantity:  item.quantity,
      }));

     const res = await API.post("/cart/placeCartOrder", {
  customerId,
  items,

  subtotal,
  mrpTotal,
  totalDiscount,

  voucherId: hasVoucher ? appliedVoucherId : null,
  voucherDiscount: hasVoucher ? voucherDiscountAmt : 0,

  deliveryCharge,
  totalPrice: total,

  payMethod,
});

      if (res.data.success) {
        await consumeVoucher(res.data.data?._id);
        navigate("/order-success");
      } else {
        setOrderErr(res.data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      setOrderErr(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const ErrorBanner = () => orderErr ? (
    <div className="flex items-center gap-2 mb-3 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 text-xs text-red-400">
      <FiX size={13} className="shrink-0"/> {orderErr}
    </div>
  ) : null;

  const PayBtnContent = ({ small=false }) => placing ? (
    <><svg className={`spin-anim ${small?"w-4 h-4":"w-5 h-5"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Processing…</>
  ) : (
    <><IoIosFlash size={small?18:22}/>{mode==="offline" ? `Confirm Order · ${fmt(total)}` : `Pay ${fmt(total)}`}</>
  );

  return (
    <>
    <Helmet>
  <title>Payment | ChomokTomok</title>

  <meta
    name="description"
    content="Complete your payment securely to place your order on ChomokTomok."
  />

  <meta name="robots" content="noindex,nofollow" />
</Helmet>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box} body{margin:0} input{outline:none}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:rgba(160,120,255,0.28);border-radius:4px}
        .cinzel{font-family:'Cinzel',serif}
        @keyframes sk-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes spin-anim-kf{to{transform:rotate(360deg)}} .spin-anim{animation:spin-anim-kf 1s linear infinite}
      `}</style>

      <div className="min-h-screen bg-[#0E1320] text-[#e8e0ff] pb-32 lg:pb-12" style={{ fontFamily:"'Raleway',sans-serif" }}>
        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Stepper current={2}/>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ══ LEFT ══ */}
            <div className="flex flex-col gap-5">

              {/* Payment mode */}
              <Card>
                <SecLabel>Select Payment Mode</SecLabel>
                <div className="flex flex-col gap-3">
                  <RadioOption selected={mode==="offline"} onClick={() => setMode("offline")} icon={<FiShoppingBag size={20}/>} label="Cash on Delivery (Offline)" sublabel="Pay in cash when your order is delivered"/>
                  <RadioOption selected={mode==="online"}  onClick={() => setMode("online")}  icon={<RiSecurePaymentLine size={20}/>} label="Pay Online" sublabel="Card, UPI, Net Banking & more"/>
                </div>

                {mode === "online" && (
                  <div className="mt-4">
                    <Divider/>
                    <div className="flex gap-3 mt-3 mb-4">
                      <SubOption selected={onlineMode==="card"} onClick={() => setOnlineMode("card")} icon={<FiCreditCard/>} label="Card"/>
                      <SubOption selected={onlineMode==="upi"}  onClick={() => setOnlineMode("upi")}  icon={<FiSmartphone/>}  label="UPI"/>
                    </div>

                    {onlineMode === "card" && (
                      <div className="flex flex-col gap-3.5">
                        <div className="flex items-center gap-2 mb-1"><FiCreditCard size={14} className="text-[#a078ff]"/><span className="text-xs text-[#8880aa] uppercase tracking-widest">Credit / Debit / ATM Card</span></div>
                        <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-1" style={{ background:"linear-gradient(135deg,#2a1a5e,#1a0a3e,#0e0628)" }}>
                          <div className="absolute inset-0 opacity-20" style={{ backgroundImage:"radial-gradient(circle at 80% 20%,rgba(160,120,255,0.6) 0%,transparent 50%)" }}/>
                          <div className="absolute top-4 left-5 right-5 flex justify-between items-start">
                            <div className="text-[10px] uppercase tracking-[0.2em] text-[#a078ff]/70">Secured Card</div>
                            <BsShieldLockFill size={18} className="text-[#a078ff]/60"/>
                          </div>
                          <div className="absolute bottom-4 left-5 right-5">
                            <div className="text-base font-mono tracking-[0.15em] text-[#e8e0ff] mb-2">{cardNum||"•••• •••• •••• ••••"}</div>
                            <div className="flex justify-between items-end">
                              <div><div className="text-[8px] text-[#8880aa] uppercase tracking-widest">Card Holder</div><div className="text-xs text-[#e8e0ff] font-medium">{cardName||"YOUR NAME"}</div></div>
                              <div className="text-right"><div className="text-[8px] text-[#8880aa] uppercase tracking-widest">Expires</div><div className="text-xs text-[#e8e0ff] font-medium">{cardExp||"MM/YY"}</div></div>
                            </div>
                          </div>
                        </div>
                        <div><FieldLabel>Card Number</FieldLabel><TextInput type="tel" value={cardNum} onChange={(e)=>setCardNum(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" hasError={cardErr.num} maxLength={19}/>{cardErr.num && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><FiX size={11}/>Enter a valid 16-digit card number</p>}</div>
                        <div><FieldLabel>Name on Card</FieldLabel><TextInput value={cardName} onChange={(e)=>setCardName(e.target.value.toUpperCase())} placeholder="As printed on card" hasError={cardErr.name}/>{cardErr.name && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><FiX size={11}/>Please enter the cardholder name</p>}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><FieldLabel>Expiry (MM/YY)</FieldLabel><TextInput type="tel" value={cardExp} onChange={(e)=>setCardExp(formatExp(e.target.value))} placeholder="MM/YY" hasError={cardErr.exp} maxLength={5}/>{cardErr.exp && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><FiX size={11}/>Invalid expiry</p>}</div>
                          <div><FieldLabel>CVV</FieldLabel><TextInput type="password" value={cardCvv} onChange={(e)=>setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="•••" hasError={cardErr.cvv} maxLength={4}/>{cardErr.cvv && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><FiX size={11}/>Invalid CVV</p>}</div>
                        </div>
                        <div className="flex items-start gap-2 bg-[rgba(160,120,255,0.06)] border border-[rgba(160,120,255,0.12)] rounded-xl px-3 py-2.5 text-[11px] text-[#8880aa] leading-relaxed">
                          <BsShieldLockFill size={13} className="text-[#a078ff] shrink-0 mt-0.5"/> Cards are secured as per RBI guidelines. Your CVV is never stored.
                        </div>
                      </div>
                    )}

                    {onlineMode === "upi" && (
                      <div className="flex flex-col gap-3.5">
                        <div className="flex items-center gap-2 mb-1"><FiSmartphone size={14} className="text-[#a078ff]"/><span className="text-xs text-[#8880aa] uppercase tracking-widest">UPI Payment</span></div>
                        <div className="flex items-center justify-center gap-4 py-4 bg-[rgba(160,120,255,0.05)] border border-[rgba(160,120,255,0.1)] rounded-xl mb-1">
                          {[{ name:"GPay", icon:gpayLogo },{ name:"PhonePe", icon:phonepayLogo },{ name:"Paytm", icon:paytmLogo }].map((app) => (
                            <div key={app.name} className="flex flex-col items-center gap-1.5">
                              <div className="w-10 h-10 rounded-xl bg-white border border-[rgba(160,120,255,0.2)] flex items-center justify-center overflow-hidden p-1"><img src={app.icon} alt={app.name} className="w-full h-full object-contain"/></div>
                              <span className="text-[9px] text-[#8880aa]">{app.name}</span>
                            </div>
                          ))}
                        </div>
                        <div><FieldLabel>Enter UPI ID</FieldLabel><TextInput value={upiId} onChange={(e)=>{setUpiId(e.target.value);setUpiErr(false);}} placeholder="yourname@upi" hasError={upiErr}/>{upiErr && <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1"><FiX size={11}/>Enter a valid UPI ID (e.g. name@bank)</p>}</div>
                        <div className="flex items-start gap-2 bg-[rgba(160,120,255,0.06)] border border-[rgba(160,120,255,0.12)] rounded-xl px-3 py-2.5 text-[11px] text-[#8880aa] leading-relaxed">
                          <BsShieldLockFill size={13} className="text-[#a078ff] shrink-0 mt-0.5"/> You'll receive a payment request on your UPI app. Approve it to complete the order.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {mode === "offline" && (
                  <div className="mt-4 flex items-start gap-2 bg-[rgba(160,120,255,0.06)] border border-[rgba(160,120,255,0.12)] rounded-xl px-3 py-2.5 text-[11px] text-[#8880aa] leading-relaxed">
                    <FiShoppingBag size={13} className="text-[#a078ff] shrink-0 mt-0.5"/> Keep the exact amount ready at delivery. Our delivery partner accepts cash only.
                  </div>
                )}
              </Card>

              {/* Cart items recap */}
              {cartLoading ? <SkeletonCard rows={2}/> : (
                <Card>
                  <SecLabel>Order Items ({cartItems.length})</SecLabel>
                  <div className="flex flex-col divide-y divide-[rgba(160,120,255,0.08)]">
                    {cartItems.map((item) => {
                      const thumb    = imgUrl(item.product?.thumbnail || item.product?.images?.[0]);
                      const unitPrice= item.product?.finalPrice || 0;
                      const mrp      = item.product?.mrp || 0;
                      const discount = item.product?.discount || 0;
                      return (
                        <div key={item.cartId} className="flex gap-3 items-center py-2.5">
                          <div className="w-11 h-11 rounded-xl bg-[#0E1320] border border-[rgba(160,120,255,0.18)] flex items-center justify-center shrink-0 overflow-hidden">
                            {thumb ? <img src={thumb} alt={item.product?.name} className="w-full h-full object-cover"/> : <div className="text-[#8880aa] text-[9px]">N/A</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#e8e0ff] leading-snug truncate" style={{ fontFamily:"'Poppins',sans-serif" }}>{item.product?.name}</div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              {item.size && <span className="text-[10px] text-[#a078ff]">Size: {item.size}</span>}
                              <span className="text-[10px] text-[#8880aa]">Qty: {item.quantity}</span>
                              {discount > 0 && <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 rounded-full">{discount}% off</span>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-bold text-[#17ec03]">{fmt(unitPrice * item.quantity)}</div>
                            {discount > 0 && <div className="text-[10px] text-[#8880aa] line-through">{fmt(mrp * item.quantity)}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {hasVoucher && (
                    <>
                      <Divider/>
                      <div className="flex items-center justify-between gap-2 bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.25)] rounded-xl px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0"><FiTag size={13} className="text-green-400 shrink-0"/><span className="text-xs font-mono font-bold text-green-400 truncate">{appliedVoucherId}</span></div>
                        <span className="text-[11px] text-[#8880aa] shrink-0">{appliedVoucherLabel || `${appliedVoucherValue}% OFF`} applied</span>
                      </div>
                    </>
                  )}
                </Card>
              )}
            </div>

            {/* ══ RIGHT ══ */}
            <div className="lg:sticky lg:top-20 flex flex-col gap-4">
              {cartLoading ? <SkeletonCard rows={4}/> : (
                <Card>
                  <SecLabel>Price Summary</SecLabel>
                  <div className="flex flex-col gap-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-[#8880aa]">MRP ({cartItems.length} items)</span><span className="text-[#e8e0ff] font-medium">{fmt(mrpTotal)}</span></div>
                    {totalDiscount > 0 && <div className="flex justify-between items-center"><span className="text-[#8880aa] flex items-center gap-1"><MdDiscount size={13} className="text-green-400"/> Product Discount</span><span className="text-green-400 font-semibold">− {fmt(totalDiscount)}</span></div>}
                    {hasVoucher && voucherDiscountAmt > 0 && <div className="flex justify-between items-center"><span className="text-[#8880aa] flex items-center gap-1"><FiTag size={12} className="text-green-400"/> Voucher ({appliedVoucherLabel||`${appliedVoucherValue}% OFF`})</span><span className="text-green-400 font-semibold">− {fmt(voucherDiscountAmt)}</span></div>}
                    <div>
                      <button onClick={() => setFeesOpen((p) => !p)} className="flex justify-between items-center w-full text-[#8880aa] hover:text-[#e8e0ff] transition-colors">
                        <span className="flex items-center gap-1.5"><MdDeliveryDining size={14}/> Delivery &amp; Fees {feesOpen?<FiChevronUp size={13}/>:<FiChevronDown size={13}/>}</span>
                        <span className={`font-semibold ${deliveryCharge===0?"text-green-400":"text-[#e8e0ff]"}`}>{deliveryCharge===0?"FREE":fmt(deliveryCharge)}</span>
                      </button>
                      {feesOpen && (
                        <div className="mt-2 bg-[#0E1320] border border-[rgba(160,120,255,0.13)] rounded-xl px-3 py-2.5 text-xs text-[#8880aa] leading-relaxed">
                          <div className="flex justify-between mb-1"><span>Shipping</span><span className={deliveryCharge===0?"text-green-400":"text-[#e8e0ff]"}>{deliveryCharge===0?"FREE":fmt(deliveryCharge)}</span></div>
                          <div className="flex justify-between"><span>Platform fee</span><span>₹0</span></div>
                        </div>
                      )}
                    </div>
                    <Divider/>
                    <div className="flex justify-between items-center"><span className="text-[#e8e0ff] font-semibold text-base">Total Amount</span><span className="cinzel text-xl font-bold text-[#17ec03]">{fmt(total)}</span></div>
                    {totalSaved > 0 && <div className="flex items-center justify-center gap-1 text-xs text-green-400 bg-green-400/10 rounded-lg py-2"><FiTag size={11}/> You save {fmt(totalSaved)} on this order!</div>}
                  </div>
                </Card>
              )}

              <div ref={payBtnRef}>
                {!cartLoading && (
                  <>
                    <ErrorBanner/>
                    <button onClick={handlePay} disabled={placing}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-br from-[#FFE51F] to-[#FFD600] text-[#111827] text-base font-bold tracking-wide shadow-[0_0_24px_rgba(255,229,31,0.35)] hover:shadow-[0_0_36px_rgba(255,229,31,0.55)] hover:-translate-y-[1px] transition-all duration-300 disabled:opacity-70 disabled:cursor-wait disabled:translate-y-0"
                      style={{ fontFamily:"'Poppins',sans-serif" }}>
                      <PayBtnContent/>
                    </button>
                  </>
                )}
              </div>

              {!cartLoading && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[{ icon:<BsShieldLockFill size={18} className="text-[#a078ff]"/>, label:"Secure Payment" },{ icon:<BsArrowReturnLeft size={18} className="text-[#a078ff]"/>, label:"Easy Returns" },{ icon:<BsPatchCheckFill size={18} className="text-[#a078ff]"/>, label:"Verified Seller" }].map((b,i) => (
                    <div key={i} className="bg-[#12121a] border border-[rgba(160,120,255,0.10)] rounded-xl py-2.5 flex flex-col items-center gap-1.5">
                      {b.icon}<span className="text-[9px] text-[#8880aa] leading-tight">{b.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile sticky bottom bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 bg-[#0E1320]/95 backdrop-blur border-t border-[rgba(160,120,255,0.12)] transition-transform duration-300 ease-in-out"
          style={{ transform: fixedBar ? "translateY(0)" : "translateY(100%)" }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] text-[#8880aa] uppercase tracking-widest">Total</div>
              <div className="cinzel text-lg font-bold text-[#17ec03]">{fmt(total)}</div>
            </div>
            {totalSaved > 0 && <div className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full"><FiTag size={11}/> Save {fmt(totalSaved)}</div>}
          </div>
          <ErrorBanner/>
          <button onClick={handlePay} disabled={placing}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-br from-[#FFE51F] to-[#FFD600] text-[#111827] text-sm font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-wait"
            style={{ fontFamily:"'Poppins',sans-serif" }}>
            <PayBtnContent small/>
          </button>
        </div>
      </div>
    </>
  );
}