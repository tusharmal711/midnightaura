// pages/ViewCartCheckout.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { IoIosFlash }    from "react-icons/io";
import { MdDeliveryDining, MdDiscount, MdEmail } from "react-icons/md";
import {
  FiEdit2, FiChevronDown, FiChevronUp,
  FiX, FiCheck, FiUser, FiPhone, FiTag, FiLoader,
} from "react-icons/fi";
import {
  BsShieldLockFill, BsArrowReturnLeft, BsPatchCheckFill,
} from "react-icons/bs";
import { RiMapPin2Fill } from "react-icons/ri";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const BASE_URL = "https://midnightaura-1.onrender.com";
const fmt  = (n) => "₹" + Number(n).toLocaleString("en-IN");
const imgUrl = (path) =>
  !path ? null : path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

const calcDelivery = (totalItems) => {
  if (totalItems === 1) return 30;
  return 40;
};

const STEPS      = ["Address", "Order Summary", "Payment"];
const ADDR_FIELDS = [
  { key: "addressLine1", label: "Address Line 1", placeholder: "Street / Flat / Building",  autoComplete: "address-line1" },
  { key: "addressLine2", label: "Address Line 2", placeholder: "Area / Landmark",            autoComplete: "address-line2", optional: true },
  { key: "city",         label: "City",           placeholder: "City",                       autoComplete: "address-level2" },
  { key: "district",     label: "District",       placeholder: "District",                   autoComplete: "off" },
  { key: "state",        label: "State",          placeholder: "State",                      autoComplete: "address-level1" },
  { key: "pincode",      label: "PIN Code",       placeholder: "PIN Code",                   autoComplete: "postal-code" },
  { key: "country",      label: "Country",        placeholder: "Country",                    autoComplete: "country-name" },
];

function getStoredEmail() {
  try { const s = localStorage.getItem("user"); if (s) { const p = JSON.parse(s); if (p?.email) return p.email; } } catch (_) {}
  try { const c = Cookies.get("user"); if (c) { const p = JSON.parse(c); if (p?.email) return p.email; } } catch (_) {}
  return null;
}

// ── UI primitives ─────────────────────────────────────────────────────────────
const Stepper = ({ current }) => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:0, marginBottom:"2rem", userSelect:"none" }}>
    {STEPS.map((label, i) => {
      const done = i < current, active = i === current;
      return (
        <div key={i} style={{ display:"flex", alignItems:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{
              width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:700, fontSize:11, border:"2px solid",
              borderColor: done||active ? "#a078ff" : "rgba(160,120,255,0.22)",
              background: done ? "#a078ff" : "transparent",
              color: done ? "#fff" : active ? "#a078ff" : "#8880aa",
              boxShadow: active ? "0 0 10px rgba(160,120,255,0.3)" : done ? "0 0 14px rgba(160,120,255,0.55)" : "none",
            }}>
              {done ? <FiCheck size={14}/> : i+1}
            </div>
            <span style={{ fontSize:"8.5px", letterSpacing:"0.15em", textTransform:"uppercase",
              color: active ? "#a078ff" : done ? "rgba(160,120,255,0.7)" : "#8880aa" }}>
              {label}
            </span>
          </div>
          {i < STEPS.length-1 && <div style={{ width:48, height:1, margin:"0 4px 16px", background: done ? "#a078ff" : "rgba(160,120,255,0.18)" }}/>}
        </div>
      );
    })}
  </div>
);

const Card = ({ children, style={} }) => (
  <div style={{ background:"#12121a", border:"1px solid rgba(160,120,255,0.13)", borderRadius:16, padding:"1rem 1.1rem", minWidth:0, overflow:"hidden", ...style }}>
    {children}
  </div>
);

const Divider    = () => <div style={{ height:1, background:"rgba(160,120,255,0.10)", margin:"0.75rem 0" }}/>;
const SecLabel   = ({ children }) => <div style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:"#8880aa", marginBottom:12 }}>{children}</div>;
const FieldLabel = ({ children }) => <div style={{ fontSize:10, color:"#8880aa", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>{children}</div>;
const ErrorMsg   = ({ msg }) => (
  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6, fontSize:12, color:"#f87171" }}>
    <FiX size={12}/> {msg}
  </div>
);

function StyledInput({ value, onValueChange, placeholder="", type="text", hasError=false, readOnly=false, autoComplete="off" }) {
  return (
    <input type={type} value={value} autoComplete={autoComplete} readOnly={readOnly}
      onChange={(e) => onValueChange?.(e.target.value)}
      placeholder={placeholder}
      style={{
        width:"100%", boxSizing:"border-box", minWidth:0,
        background: readOnly ? "rgba(255,255,255,0.03)" : "#0E1320",
        border:`1px solid ${hasError ? "rgba(239,68,68,0.6)" : "rgba(160,120,255,0.25)"}`,
        borderRadius:12, padding:"0.6rem 1rem",
        color: readOnly ? "rgba(255,255,255,0.35)" : "#e8e0ff",
        fontSize:"0.9rem", outline:"none", cursor: readOnly ? "not-allowed" : "auto",
      }}
      onFocus={(e) => { if (!readOnly && !hasError) e.target.style.borderColor="#a078ff"; }}
      onBlur={(e)  => { if (!readOnly) e.target.style.borderColor = hasError ? "rgba(239,68,68,0.6)" : "rgba(160,120,255,0.25)"; }}
    />
  );
}

const InfoRow = ({ icon, label, children }) => (
  <div style={{ display:"flex", alignItems:"flex-start", gap:12, fontSize:14 }}>
    <div style={{ width:36, height:36, borderRadius:12, background:"rgba(160,120,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      {icon}
    </div>
    <div style={{ flex:1, minWidth:0 }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  </div>
);

function ChangeModal({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:9000, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background:"#12121a", border:"1px solid rgba(160,120,255,0.28)", borderRadius:24, width:"100%", maxWidth:500, padding:"1.25rem", boxShadow:"0 0 60px rgba(160,120,255,0.25)", maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.25rem" }}>
          <div style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:"#8880aa" }}>{title}</div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", background:"rgba(160,120,255,0.08)", border:"1px solid rgba(160,120,255,0.2)", color:"#a078ff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FiX size={15}/>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position:"fixed", zIndex:99999, top:"1rem", right:"1rem", left:"1rem", display:"flex", alignItems:"center", gap:8, padding:"0.75rem 1.25rem", borderRadius:12, fontSize:"0.85rem", fontWeight:600, backdropFilter:"blur(16px)",
      background: type==="success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
      border: type==="success" ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(239,68,68,0.4)",
      color:   type==="success" ? "#6ee7b7" : "#fca5a5",
      boxShadow: type==="success" ? "0 4px 24px rgba(16,185,129,0.2)" : "0 4px 24px rgba(239,68,68,0.2)" }}>
      {type==="success" ? <FiCheck size={15}/> : <FiX size={15}/>} {message}
    </div>
  );
}

const SaveBtn = ({ onClick, loading, label="Save Changes" }) => (
  <button onClick={onClick} disabled={loading} style={{ width:"100%", padding:"0.75rem", borderRadius:14, marginTop:"1rem", background: loading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg,#a078ff,#7c3aed)", border:"1px solid rgba(139,92,246,0.5)", color:"#fff", fontSize:"0.9rem", fontWeight:700, cursor: loading ? "not-allowed" : "pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
    {loading ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"spin 0.75s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <FiCheck size={15}/>}
    {loading ? "Saving…" : label}
  </button>
);

function VoucherBox({ appliedVoucher, onApply, onRemove, applying, error }) {
  const [code, setCode] = useState("");
  if (appliedVoucher) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:12, padding:"0.65rem 0.9rem", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0, flex:1 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:"rgba(74,222,128,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <FiTag size={13} color="#4ade80"/>
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:12.5, fontWeight:700, color:"#4ade80", fontFamily:"monospace" }}>{appliedVoucher.discountId}</div>
            <div style={{ fontSize:10.5, color:"#8880aa" }}>{appliedVoucher.discountLabel} applied</div>
          </div>
        </div>
        <button onClick={onRemove} style={{ flexShrink:0, display:"flex", alignItems:"center", gap:4, background:"transparent", border:"1px solid rgba(239,68,68,0.35)", color:"#f87171", fontSize:11, fontWeight:600, padding:"5px 10px", borderRadius:8, cursor:"pointer" }}>
          <FiX size={11}/> Remove
        </button>
      </div>
    );
  }
  return (
    <div>
      <div className="co-voucher-row" style={{ display:"flex", gap:8 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <StyledInput value={code} placeholder="Have a voucher code? Enter it here" hasError={!!error}
            onValueChange={(v) => setCode(v.toUpperCase())}/>
        </div>
        <button onClick={() => { const t=code.trim(); if(t) onApply(t); }}
          disabled={applying || !code.trim()}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"0 1.1rem", borderRadius:12, border:"1px solid rgba(139,92,246,0.4)", background: applying||!code.trim() ? "rgba(160,120,255,0.15)" : "linear-gradient(135deg,#a078ff,#7c3aed)", color: applying||!code.trim() ? "#6b6490" : "#fff", fontWeight:700, fontSize:13, cursor: applying||!code.trim() ? "not-allowed" : "pointer", whiteSpace:"nowrap", flexShrink:0 }}>
          {applying && <FiLoader size={13} style={{ animation:"spin 0.75s linear infinite" }}/>}
          {applying ? "Checking…" : "Apply"}
        </button>
      </div>
      {error && <ErrorMsg msg={error}/>}
    </div>
  );
}

function SkeletonCard({ rows=4 }) {
  const sh = { background:"linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)", backgroundSize:"600px 100%", animation:"sk-shimmer 1.4s infinite linear", borderRadius:8 };
  return (
    <Card>
      <div style={{ ...sh, height:10, width:"30%", marginBottom:20 }}/>
      {Array.from({ length:rows }).map((_,i) => (
        <div key={i} style={{ display:"flex", gap:12, marginBottom:20 }}>
          <div style={{ ...sh, width:36, height:36, borderRadius:12, flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <div style={{ ...sh, height:8, width:"25%", marginBottom:10 }}/>
            <div style={{ ...sh, height:14, width:"55%" }}/>
          </div>
        </div>
      ))}
    </Card>
  );
}

// ── Cart item mini-card ───────────────────────────────────────────────────────
function CartItemRow({ item }) {
  const thumb = imgUrl(item.product?.thumbnail || item.product?.images?.[0]);
  const unitPrice = item.product?.finalPrice || 0;
  const mrp       = item.product?.mrp || 0;
  const discount  = item.product?.discount || 0;
  return (
    <div style={{ display:"flex", gap:10, alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(160,120,255,0.08)" }}>
      <div style={{ width:48, height:48, borderRadius:10, overflow:"hidden", flexShrink:0, background:"#0E1320", border:"1px solid rgba(160,120,255,0.15)" }}>
        {thumb ? <img src={thumb} alt={item.product?.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#8880aa", fontSize:9 }}>N/A</div>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#e8e0ff", fontFamily:"'Poppins',sans-serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.product?.name || "Product"}</div>
        <div style={{ display:"flex", gap:8, marginTop:2, flexWrap:"wrap" }}>
          {item.size && <span style={{ fontSize:10, color:"#a078ff" }}>Size: {item.size}</span>}
          <span style={{ fontSize:10, color:"#8880aa" }}>Qty: {item.quantity}</span>
          {discount > 0 && <span style={{ fontSize:10, color:"#4ade80", background:"rgba(74,222,128,0.1)", padding:"1px 6px", borderRadius:999 }}>{discount}% off</span>}
        </div>
      </div>
      <div style={{ textAlign:"right", flexShrink:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#17ec03" }}>{fmt(unitPrice * item.quantity)}</div>
        {discount > 0 && <div style={{ fontSize:10, color:"#8880aa", textDecoration:"line-through" }}>{fmt(mrp * item.quantity)}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ViewCartCheckout() {
  const navigate = useNavigate();
  const email    = getStoredEmail();

  // ── Cart items come from Cart page via sessionStorage ─────────────────────
  // Cart.jsx calls navigate("/cart-checkout") — we read cart from the API
  const [cartItems,     setCartItems]     = useState([]);
  const [cartLoading,   setCartLoading]   = useState(true);
  const [customerId,    setCustomerId]    = useState(null);

  // ── User / address ─────────────────────────────────────────────────────────
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [toast,         setToast]         = useState(null);
  const showToast = (message, type="success") => setToast({ message, type });

  const [savedUser,     setSavedUser]     = useState(null);
  const [savedAddress,  setSavedAddress]  = useState(null);
  const [inlineUsername,setInlineUsername] = useState("");
  const [inlinePhone,   setInlinePhone]   = useState("");
  const [inlineAltPhone,setInlineAltPhone]= useState("");
  const [inlineAddr,    setInlineAddr]    = useState({ addressLine1:"", addressLine2:"", city:"", district:"", state:"", pincode:"", country:"India" });
  const setAddrField = useCallback((key, val) => setInlineAddr((p) => ({ ...p, [key]: val })), []);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [personalOpen,   setPersonalOpen]   = useState(false);
  const [addressOpen,    setAddressOpen]    = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress,  setSavingAddress]  = useState(false);
  const [draftPersonal,  setDraftPersonal]  = useState({});
  const [draftAddress,   setDraftAddress]   = useState({});
  const [errors,         setErrors]         = useState({});
  const [feesOpen,       setFeesOpen]       = useState(false);
  const clearError = useCallback((key) => setErrors((p) => { const n={...p}; delete n[key]; return n; }), []);

  // ── Voucher ────────────────────────────────────────────────────────────────
  const [appliedVoucher,  setAppliedVoucher]  = useState(null);
  const [voucherApplying, setVoucherApplying] = useState(false);
  const [voucherError,    setVoucherError]    = useState("");

  // ── Fixed bar ──────────────────────────────────────────────────────────────
  const continueBtnRef = useRef(null);
  const [fixedBar, setFixedBar] = useState(false);
  useEffect(() => {
    const check = () => {
      if (!continueBtnRef.current) return;
      const r = continueBtnRef.current.getBoundingClientRect();
      setFixedBar(r.bottom < 0 || r.top > window.innerHeight);
    };
    check();
    window.addEventListener("scroll", check, { passive:true });
    return () => window.removeEventListener("scroll", check);
  }, [loading, cartLoading]);

  // ── Load profile ───────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!email) { setLoading(false); return; }
    try {
      const res = await API.post("/user/getProfile", { email });
      if (res.data.success) {
        const u = res.data.user    ?? {};
        const a = res.data.address ?? {};
        const ud = { username:u.username??"", email:u.email??email, phone:u.phone??"", altPhone:u.altPhone??"", gender:u.gender??"Prefer not to say" };
        const ad = { addressLine1:a.addressLine1??"", addressLine2:a.addressLine2??"", city:a.city??"", district:a.district??"", state:a.state??"", pincode:a.pincode??"", country:a.country??"India" };
        setSavedUser(ud); setSavedAddress(ad);
        setInlineUsername(ud.username); setInlinePhone(ud.phone); setInlineAltPhone(ud.altPhone);
        setInlineAddr(ad);
        setCustomerId(res.data.user?.customerId || null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Could not load profile", "error");
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Load cart ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!customerId) return;
    const fetchCart = async () => {
      setCartLoading(true);
      try {
        const res = await API.get(`/cart/getCart/${customerId}`);
        if (res.data.success) setCartItems(res.data.data || []);
      } catch (err) {
        console.error("fetchCart error:", err);
      } finally {
        setCartLoading(false);
      }
    };
    fetchCart();
  }, [customerId]);

  // ── Derived price ──────────────────────────────────────────────────────────
  let subtotal = 0, mrpTotal = 0, totalDiscount = 0;
  cartItems.forEach((item) => {
    const price = item.product?.finalPrice || 0;
    const mrp   = item.product?.mrp        || 0;
    subtotal     += price * item.quantity;
    mrpTotal     += mrp   * item.quantity;
    totalDiscount += (mrp - price) * item.quantity;
  });
const voucherPct         = appliedVoucher?.discountValue || 0;
const voucherDiscountAmt = voucherPct > 0
  ? Math.round(subtotal * (voucherPct / 100))
  : 0;

const afterVoucher = subtotal - voucherDiscountAmt;

// Number of different products in cart
const totalItems = cartItems.length;

const deliveryCharge = calcDelivery(totalItems);

const total = afterVoucher + deliveryCharge;
  const totalSaved         = totalDiscount + voucherDiscountAmt;

  // ── Effective address & user ───────────────────────────────────────────────
  const effectiveUsername = savedUser?.username?.trim() || inlineUsername;
  const effectivePhone    = savedUser?.phone?.trim()    || inlinePhone;
  const effectiveAltPhone = savedUser?.altPhone?.trim() || inlineAltPhone;
  const effectiveAddr = savedAddress
    ? Object.fromEntries(ADDR_FIELDS.map(({ key }) => [key, savedAddress[key]?.trim() ? savedAddress[key] : (inlineAddr[key] ?? "")]))
    : inlineAddr;
  const addrParts   = ADDR_FIELDS.filter(({ key }) => effectiveAddr[key]?.trim()).map(({ key }) => effectiveAddr[key]);
  const addrSummary = addrParts.join(", ");
  const emptyRequiredAddrFields  = ADDR_FIELDS.filter(({ key, optional }) => !optional && !savedAddress?.[key]?.trim());
  const hasEmptyAddrFields       = emptyRequiredAddrFields.length > 0;
  const emptyOptionalAddrFields  = ADDR_FIELDS.filter(({ key, optional }) => optional && !savedAddress?.[key]?.trim());

  // ── Open modals ────────────────────────────────────────────────────────────
  const openPersonal = () => {
    setDraftPersonal({ username:effectiveUsername, email:savedUser?.email??email, phone:effectivePhone, altPhone:effectiveAltPhone, gender:savedUser?.gender??"Prefer not to say" });
    setErrors({}); setPersonalOpen(true);
  };
  const openAddress = () => { setDraftAddress({...effectiveAddr}); setErrors({}); setAddressOpen(true); };

  const handleSavePersonal = async () => {
    if (!email) return;
    try {
      setSavingPersonal(true);
      const res = await API.post("/user/updateProfile", { email, username:draftPersonal.username, phone:draftPersonal.phone, altPhone:draftPersonal.altPhone, gender:draftPersonal.gender });
      if (res.data.success) {
        const u = res.data.user;
        const updated = { username:u.username??"", email:u.email??email, phone:u.phone??"", altPhone:u.altPhone??"", gender:u.gender??"Prefer not to say" };
        setSavedUser(updated); setInlineUsername(updated.username); setInlinePhone(updated.phone); setInlineAltPhone(updated.altPhone);
        setPersonalOpen(false); showToast("Personal details updated 🎉");
      }
    } catch (err) { showToast(err.response?.data?.message || "Failed to update", "error"); }
    finally { setSavingPersonal(false); }
  };

  const handleSaveAddress = async () => {
    if (!email) return;
    try {
      setSavingAddress(true);
      const res = await API.post("/user/updateAddress", { email, ...draftAddress });
      if (res.data.success) {
        const a = res.data.address;
        const updated = { addressLine1:a.addressLine1??"", addressLine2:a.addressLine2??"", city:a.city??"", district:a.district??"", state:a.state??"", pincode:a.pincode??"", country:a.country??"India" };
        setSavedAddress(updated); setInlineAddr(updated); setAddressOpen(false); showToast("Address updated 🎉");
      }
    } catch (err) { showToast(err.response?.data?.message || "Failed to update address", "error"); }
    finally { setSavingAddress(false); }
  };

  // ── Apply / remove voucher ────────────────────────────────────────────────
  const handleApplyVoucher = async (code) => {
    if (!email) { setVoucherError("Please log in to use a voucher."); return; }
    setVoucherApplying(true); setVoucherError("");
    try {
      const res = await API.post("/discount/validateDiscount", { discountId:code, userEmail:email });
      if (res.data.success) { setAppliedVoucher(res.data.voucher); showToast(`Voucher ${code} applied 🎉`); }
      else setVoucherError(res.data.message || "Could not apply this voucher.");
    } catch (err) { setVoucherError(err.response?.data?.message || "Invalid or expired voucher code."); }
    finally { setVoucherApplying(false); }
  };
  const handleRemoveVoucher = () => { setAppliedVoucher(null); setVoucherError(""); };

  // ── Continue ───────────────────────────────────────────────────────────────
  const handleContinue = async () => {
    const finalUsername = effectiveUsername.trim();
    const finalPhone    = effectivePhone.trim();
    const finalAltPhone = effectiveAltPhone.trim();
    const errs = {};
    if (!finalUsername) errs.username = "Name is required";
    if (!finalPhone)    errs.phone    = "Mobile number is required";
    if (!finalAltPhone || finalAltPhone.replace(/\D/g,"").length < 10) errs.altPhone = "A valid 10-digit alternative number is required";
    ADDR_FIELDS.forEach(({ key, optional, label }) => {
      if (!optional && !effectiveAddr[key]?.trim()) errs[key] = `${label} is required`;
    });
    if (Object.keys(errs).length > 0) { setErrors(errs); window.scrollTo({ top:0, behavior:"smooth" }); return; }

    try {
      setSaving(true);
      const personalChanged = finalUsername !== savedUser?.username || finalPhone !== savedUser?.phone || finalAltPhone !== savedUser?.altPhone;
      if (personalChanged) {
        const pRes = await API.post("/user/updateProfile", { email, username:finalUsername, phone:finalPhone, altPhone:finalAltPhone, gender:savedUser?.gender??"Prefer not to say" });
        if (pRes.data.success) { const u=pRes.data.user; setSavedUser({ username:u.username??"", email:u.email??email, phone:u.phone??"", altPhone:u.altPhone??"", gender:u.gender??"Prefer not to say" }); }
      }
      const addrChanged = ADDR_FIELDS.some(({ key }) => effectiveAddr[key] !== savedAddress?.[key]);
      if (addrChanged) {
        const aRes = await API.post("/user/updateAddress", { email, ...effectiveAddr });
        if (aRes.data.success) { const a=aRes.data.address; setSavedAddress({ addressLine1:a.addressLine1??"", addressLine2:a.addressLine2??"", city:a.city??"", district:a.district??"", state:a.state??"", pincode:a.pincode??"", country:a.country??"India" }); }
      }
      // Stash voucher for payment page
      if (appliedVoucher) {
        sessionStorage.setItem("cartAppliedVoucherId",    appliedVoucher.discountId);
        sessionStorage.setItem("cartAppliedVoucherLabel", appliedVoucher.discountLabel);
        sessionStorage.setItem("cartAppliedVoucherValue", String(appliedVoucher.discountValue));
      } else {
        sessionStorage.removeItem("cartAppliedVoucherId");
        sessionStorage.removeItem("cartAppliedVoucherLabel");
        sessionStorage.removeItem("cartAppliedVoucherValue");
      }
      navigate("/cart-payment");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not save details. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const isPageLoading = loading || cartLoading;
  const changeBtn = { display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:"#a078ff", border:"1px solid rgba(160,120,255,0.3)", padding:"0.3rem 0.85rem", borderRadius:10, background:"transparent", cursor:"pointer" };

  if (!email && !loading) return (
    <div style={{ minHeight:"100vh", background:"#0E1320", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#f87171", fontSize:14, textAlign:"center" }}>⚠️ No session found. Please <a href="/login" style={{ color:"#f87171" }}>log in</a> again.</div>
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box} body{margin:0} input{outline:none}
        html,body{overflow-x:hidden}
        ::-webkit-scrollbar{width:2px} ::-webkit-scrollbar-thumb{background:rgba(160,120,255,0.22);border-radius:2px}
        .cinzel{font-family:'Cinzel',serif}
        @keyframes sk-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .co-voucher-row{flex-direction:row}
        @media(min-width:1024px){.co-grid{grid-template-columns:1fr 360px !important}}
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)}/>}

      {/* Personal modal */}
      {personalOpen && (
        <ChangeModal title="Edit Personal Details" onClose={() => setPersonalOpen(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
            {[{ key:"username", label:"Username", type:"text", placeholder:"Your name", ac:"name" },
              { key:"phone",    label:"Phone Number", type:"tel", placeholder:"10-digit mobile", ac:"tel" },
              { key:"altPhone", label:"Alternative Phone", type:"tel", placeholder:"10-digit alternative", ac:"tel" }
            ].map(({ key, label, type, placeholder, ac }) => (
              <div key={key}>
                <FieldLabel>{label}</FieldLabel>
                <StyledInput type={type} value={draftPersonal[key]??""} placeholder={placeholder} autoComplete={ac} onValueChange={(v) => setDraftPersonal((p) => ({ ...p, [key]:v }))}/>
              </div>
            ))}
            <div><FieldLabel>Email <span style={{ color:"#8880aa", fontSize:10 }}>(locked)</span></FieldLabel><StyledInput value={draftPersonal.email??""} readOnly autoComplete="email" onValueChange={() => {}}/></div>
            <SaveBtn onClick={handleSavePersonal} loading={savingPersonal}/>
          </div>
        </ChangeModal>
      )}

      {/* Address modal */}
      {addressOpen && (
        <ChangeModal title="Edit Delivery Address" onClose={() => setAddressOpen(false)}>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
            {ADDR_FIELDS.map(({ key, label, placeholder, optional, autoComplete:ac }) => (
              <div key={key}>
                <FieldLabel>{label}{optional && <span style={{ color:"#555", marginLeft:4 }}>(optional)</span>}</FieldLabel>
                <StyledInput value={draftAddress[key]??""} placeholder={placeholder||label} hasError={!!errors[key]} autoComplete={ac} onValueChange={(v) => setDraftAddress((p) => ({ ...p, [key]:v }))}/>
                {errors[key] && <ErrorMsg msg={errors[key]}/>}
              </div>
            ))}
            <SaveBtn onClick={handleSaveAddress} loading={savingAddress} label="Save Address"/>
          </div>
        </ChangeModal>
      )}

      <div style={{ minHeight:"100vh", background:"#0E1320", color:"#e8e0ff", paddingBottom:112, fontFamily:"'Raleway',sans-serif", overflowX:"hidden" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"1.25rem 0.85rem 0" }}>
          <Stepper current={1}/>

          <div className="co-grid" style={{ display:"grid", gridTemplateColumns:"1fr", gap:"1.25rem", minWidth:0 }}>

            {/* ══ LEFT ══ */}
            <div style={{ display:"flex", flexDirection:"column", gap:"1.1rem", minWidth:0 }}>

              {/* Delivery Details */}
              {isPageLoading ? <SkeletonCard rows={5}/> : (
                <Card>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem", gap:8, flexWrap:"wrap" }}>
                    <SecLabel>Delivery Details</SecLabel>
                    <button style={changeBtn} onClick={openPersonal}><FiEdit2 size={12}/> Change Details</button>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                    <InfoRow icon={<FiUser size={15} color="#a078ff"/>} label="Name">
                      {savedUser?.username?.trim() ? <div style={{ color:"#e8e0ff", fontWeight:600 }}>{savedUser.username}</div> : (
                        <><StyledInput value={inlineUsername} placeholder="Enter your name" hasError={!!errors.username} autoComplete="name" onValueChange={(v) => { setInlineUsername(v); clearError("username"); }}/>{errors.username && <ErrorMsg msg={errors.username}/>}</>
                      )}
                    </InfoRow>
                    <InfoRow icon={<FiPhone size={15} color="#a078ff"/>} label="Mobile">
                      {savedUser?.phone?.trim() ? <div style={{ color:"#e8e0ff", fontWeight:600 }}>{savedUser.phone}</div> : (
                        <><StyledInput type="tel" value={inlinePhone} placeholder="10-digit mobile" hasError={!!errors.phone} autoComplete="tel" onValueChange={(v) => { setInlinePhone(v); clearError("phone"); }}/>{errors.phone && <ErrorMsg msg={errors.phone}/>}</>
                      )}
                    </InfoRow>
                    <InfoRow icon={<FiPhone size={15} color="#a078ff"/>} label="Alternative Mobile">
                      {savedUser?.altPhone?.trim() ? <div style={{ color:"#e8e0ff", fontWeight:600 }}>{savedUser.altPhone}</div> : (
                        <><StyledInput type="tel" value={inlineAltPhone} placeholder="10-digit alternative number" hasError={!!errors.altPhone} autoComplete="tel" onValueChange={(v) => { setInlineAltPhone(v); clearError("altPhone"); }}/>{errors.altPhone && <ErrorMsg msg={errors.altPhone}/>}</>
                      )}
                    </InfoRow>
                    <InfoRow icon={<MdEmail size={16} color="#a078ff"/>} label="Email">
                      <div style={{ color:"#e8e0ff", fontWeight:600, overflowWrap:"anywhere" }}>{savedUser?.email}</div>
                    </InfoRow>
                    <Divider/>
                    <InfoRow icon={<RiMapPin2Fill size={16} color="#a078ff"/>} label="Delivery Address">
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          {addrSummary ? <div style={{ color:"#e8e0ff", fontWeight:500, lineHeight:1.6, fontSize:14, marginBottom: hasEmptyAddrFields ? "0.75rem" : 0, overflowWrap:"anywhere" }}>{addrSummary}</div>
                          : <div style={{ color:"#8880aa", fontSize:13, marginBottom:"0.75rem" }}>Please fill in your delivery address below.</div>}
                        </div>
                        {addrSummary && <button style={{ ...changeBtn, flexShrink:0 }} onClick={openAddress}><FiEdit2 size={12}/> Change</button>}
                      </div>
                    </InfoRow>
                    {(hasEmptyAddrFields || emptyOptionalAddrFields.length > 0) && (
                      <div style={{ display:"flex", flexDirection:"column", gap:"0.85rem" }}>
                        {emptyRequiredAddrFields.map(({ key, label, placeholder, autoComplete:ac }) => (
                          <div key={key} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                            <div style={{ width:36, flexShrink:0 }}/>
                            <div style={{ flex:1, minWidth:0 }}>
                              <FieldLabel>{label}</FieldLabel>
                              <StyledInput value={inlineAddr[key]??""} placeholder={placeholder||label} hasError={!!errors[key]} autoComplete={ac} onValueChange={(v) => { setAddrField(key,v); clearError(key); }}/>
                              {errors[key] && <ErrorMsg msg={errors[key]}/>}
                            </div>
                          </div>
                        ))}
                        {emptyOptionalAddrFields.map(({ key, label, placeholder, autoComplete:ac }) => (
                          <div key={key} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                            <div style={{ width:36, flexShrink:0 }}/>
                            <div style={{ flex:1, minWidth:0 }}>
                              <FieldLabel>{label} <span style={{ color:"#555" }}>(optional)</span></FieldLabel>
                              <StyledInput value={inlineAddr[key]??""} placeholder={placeholder||label} autoComplete={ac} onValueChange={(v) => setAddrField(key,v)}/>
                            </div>
                          </div>
                        ))}
                        {!addrSummary && (
                          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                            <div style={{ width:36, flexShrink:0 }}/>
                            <button onClick={openAddress} style={{ display:"flex", alignItems:"center", gap:6, padding:"0.45rem 1.1rem", borderRadius:10, background:"rgba(160,120,255,0.08)", border:"1px solid rgba(160,120,255,0.3)", color:"#a078ff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                              <FiEdit2 size={12}/> Edit Full Address
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Cart Items */}
              {isPageLoading ? <SkeletonCard rows={3}/> : (
                <Card>
                  <SecLabel>Order Items ({cartItems.length})</SecLabel>
                  <div style={{ display:"flex", flexDirection:"column" }}>
                    {cartItems.map((item) => <CartItemRow key={item.cartId} item={item}/>)}
                  </div>
                  <Divider/>
                  <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:14 }}>
                    <MdDeliveryDining size={22} color="#a078ff" style={{ flexShrink:0 }}/>
                    <div>
                      <FieldLabel>Estimated Delivery</FieldLabel>
                      <div style={{ color:"#e8e0ff", fontWeight:500 }}>
                        <span style={{ color:"#4ade80", fontWeight:700 }}>3–7 Business Days</span>{" — "}
                        <span style={{ color: deliveryCharge===0 ? "#4ade80" : "#e8e0ff", fontSize:12, fontWeight:700 }}>
                          {deliveryCharge===0 ? "FREE Delivery" : `Delivery Charge: ${fmt(deliveryCharge)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* ══ RIGHT ══ */}
            <div style={{ display:"flex", flexDirection:"column", gap:"1rem", minWidth:0 }}>

              {/* Voucher */}
              {!isPageLoading && (
                <Card>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:8, marginBottom:12, padding:"8px 16px", background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.4)", borderRadius:"999px", color:"#4ade80", fontSize:11, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                    <span style={{ background:"#22c55e", color:"#fff", fontSize:9, fontWeight:700, padding:"3px 7px", borderRadius:999 }}>SAVE</span>
                    <FiTag size={13}/> Apply Voucher
                  </div>
                  <VoucherBox appliedVoucher={appliedVoucher} onApply={handleApplyVoucher} onRemove={handleRemoveVoucher} applying={voucherApplying} error={voucherError}/>
                </Card>
              )}

              {/* Price Summary */}
              {isPageLoading ? <SkeletonCard rows={4}/> : (
                <Card>
                  <SecLabel>Price Summary</SecLabel>
                  <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", fontSize:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                      <span style={{ color:"#8880aa" }}>MRP ({cartItems.length} item{cartItems.length!==1?"s":""})</span>
                      <span style={{ color:"#e8e0ff", fontWeight:500 }}>{fmt(mrpTotal)}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                        <span style={{ color:"#8880aa", display:"flex", alignItems:"center", gap:4 }}><MdDiscount size={13} color="#4ade80"/> Product Discount</span>
                        <span style={{ color:"#4ade80", fontWeight:600, flexShrink:0 }}>− {fmt(totalDiscount)}</span>
                      </div>
                    )}
                    {appliedVoucher && voucherDiscountAmt > 0 && (
                      <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                        <span style={{ color:"#8880aa", display:"flex", alignItems:"center", gap:4, minWidth:0 }}>
                          <FiTag size={12} color="#4ade80" style={{ flexShrink:0 }}/>
                          <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>Voucher ({appliedVoucher.discountLabel})</span>
                        </span>
                        <span style={{ color:"#4ade80", fontWeight:600, flexShrink:0 }}>− {fmt(voucherDiscountAmt)}</span>
                      </div>
                    )}
                    <div>
                      <button onClick={() => setFeesOpen((p) => !p)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%", background:"transparent", border:"none", color:"#8880aa", cursor:"pointer", fontSize:14, gap:8 }}>
                        <span style={{ display:"flex", alignItems:"center", gap:6 }}><MdDeliveryDining size={14}/> Delivery &amp; Fees {feesOpen ? <FiChevronUp size={13}/> : <FiChevronDown size={13}/>}</span>
                        <span style={{ color: deliveryCharge===0 ? "#4ade80" : "#e8e0ff", fontWeight:600, flexShrink:0 }}>{deliveryCharge===0 ? "FREE" : fmt(deliveryCharge)}</span>
                      </button>
                      {feesOpen && (
                        <div style={{ marginTop:8, background:"#0E1320", border:"1px solid rgba(160,120,255,0.13)", borderRadius:12, padding:"0.6rem 0.9rem", fontSize:12, color:"#8880aa", lineHeight:2 }}>
                          <div style={{ display:"flex", justifyContent:"space-between" }}><span>Shipping</span><span style={{ color: deliveryCharge===0?"#4ade80":"#e8e0ff" }}>{deliveryCharge===0?"FREE":fmt(deliveryCharge)}</span></div>
                          <div style={{ display:"flex", justifyContent:"space-between" }}><span>Platform fee</span><span>₹0</span></div>
                        </div>
                      )}
                    </div>
                    <Divider/>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                      <span style={{ color:"#e8e0ff", fontWeight:600, fontSize:15 }}>Total Amount</span>
                      <span className="cinzel" style={{ fontSize:22, fontWeight:700, color:"#17ec03" }}>{fmt(total)}</span>
                    </div>
                    {totalSaved > 0 && (
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:12, color:"#4ade80", background:"rgba(74,222,128,0.08)", borderRadius:10, padding:"0.5rem", textAlign:"center" }}>
                        <FiTag size={11} style={{ flexShrink:0 }}/> You save {fmt(totalSaved)} on this order!
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Continue button */}
              <div ref={continueBtnRef}>
                {!isPageLoading && (
                  <button onClick={handleContinue} disabled={saving}
                    style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"1rem 0", borderRadius:18, border:"none", background: saving ? "rgba(255,214,0,0.5)" : "linear-gradient(135deg,#FFE51F,#FFD600)", color:"#111827", fontWeight:700, fontSize:15, cursor: saving ? "not-allowed" : "pointer", boxShadow:"0 0 24px rgba(255,229,31,0.35)", fontFamily:"'Poppins',sans-serif" }}>
                    {saving ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"spin 0.75s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving…</> : <><IoIosFlash size={22}/> Continue to Payment</>}
                  </button>
                )}
              </div>

              {/* Trust badges */}
              {!isPageLoading && (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, textAlign:"center" }}>
                  {[{ icon:<BsShieldLockFill size={18} color="#a078ff"/>, label:"Secure Payment" }, { icon:<BsArrowReturnLeft size={18} color="#a078ff"/>, label:"Easy Returns" }, { icon:<BsPatchCheckFill size={18} color="#a078ff"/>, label:"Verified Seller" }].map((b,i) => (
                    <div key={i} style={{ background:"#12121a", border:"1px solid rgba(160,120,255,0.10)", borderRadius:12, padding:"0.6rem 0.4rem", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                      {b.icon}<span style={{ fontSize:9, color:"#8880aa", lineHeight:1.25 }}>{b.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fixed bottom bar */}
        <div style={{ position:"fixed",  display: window.innerWidth > 768 ? "none" : "block", bottom:0, left:0, right:0, zIndex:50, padding:"0.75rem 1rem", background:"rgba(14,19,32,0.95)", backdropFilter:"blur(12px)", borderTop:"1px solid rgba(160,120,255,0.12)", transition:"transform 0.3s ease-in-out", transform: fixedBar ? "translateY(0)" : "translateY(100%)" }}>
          <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
              <div>
                <div style={{ fontSize:10, color:"#8880aa", textTransform:"uppercase", letterSpacing:"0.1em" }}>Total</div>
                <div className="cinzel" style={{ fontSize:20, fontWeight:700, color:"#17ec03" }}>{fmt(total)}</div>
              </div>
              {totalSaved > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#4ade80", background:"rgba(74,222,128,0.1)", padding:"4px 10px", borderRadius:999, flexShrink:0, whiteSpace:"nowrap" }}>
                  <FiTag size={11}/> Save {fmt(totalSaved)}
                </div>
              )}
            </div>
            <button onClick={handleContinue} disabled={saving}
              style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"0.875rem", borderRadius:14, border:"none", background: saving ? "rgba(255,214,0,0.5)" : "linear-gradient(135deg,#FFE51F,#FFD600)", color:"#111827", fontSize:14, fontWeight:700, cursor: saving?"not-allowed":"pointer", fontFamily:"'Poppins',sans-serif" }}>
              {saving ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"spin 0.75s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Saving…</> : <><IoIosFlash size={20}/> Continue to Payment</>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}