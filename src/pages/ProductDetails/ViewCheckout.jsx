import { useState, useEffect, useRef, useCallback } from "react";
import { IoIosFlash } from "react-icons/io";
import { MdDeliveryDining, MdDiscount, MdEmail } from "react-icons/md";
import { Helmet } from "react-helmet-async";
import {
  FiEdit2, FiChevronDown, FiChevronUp,
  FiX, FiCheck, FiUser, FiPhone, FiTag, FiLoader,
} from "react-icons/fi";
import {
  BsShieldLockFill, BsArrowReturnLeft,
  BsPatchCheckFill, BsTagFill,
} from "react-icons/bs";
import { RiMapPin2Fill } from "react-icons/ri";
import Cookies from "js-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../../api";
import CryptoJS from "crypto-js";

const SECRET_KEY = "midnightaura_secret_key";
const BASE_URL   = "http://localhost:8008";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStoredEmail() {
  try {
    const s = localStorage.getItem("user");
    if (s) { const p = JSON.parse(s); if (p?.email) return p.email; }
  } catch (_) {}
  try {
    const c = Cookies.get("user");
    if (c) { const p = JSON.parse(c); if (p?.email) return p.email; }
  } catch (_) {}
  return null;
}

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

/**
 * Delivery charge rule:
 *   finalPrice >= 699  →  FREE (0)
 *   finalPrice <  699  →  7% of finalPrice (rounded)
 */
const calcDelivery = (finalPrice) =>
  finalPrice >= 699 ? 0 : Math.round(finalPrice * 0.07);

const STEPS = ["Address", "Order Summary", "Payment"];

const ADDR_FIELDS = [
  { key: "addressLine1", label: "Address Line 1", placeholder: "Street / Flat / Building",  autoComplete: "address-line1" },
  { key: "addressLine2", label: "Address Line 2", placeholder: "Area / Landmark",            autoComplete: "address-line2", optional: true },
  { key: "city",         label: "City",           placeholder: "City",                       autoComplete: "address-level2" },
  { key: "district",     label: "District",       placeholder: "District",                   autoComplete: "off" },
  { key: "state",        label: "State",          placeholder: "State",                      autoComplete: "address-level1" },
  { key: "pincode",      label: "PIN Code",       placeholder: "PIN Code",                   autoComplete: "postal-code" },
  { key: "country",      label: "Country",        placeholder: "Country",                    autoComplete: "country-name" },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard({ rows = 4 }) {
  const shimmer = {
    background: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
    backgroundSize: "600px 100%",
    animation: "sk-shimmer 1.4s infinite linear",
    borderRadius: 8,
  };
  return (
    <div className="checkout-card">
      <div style={{ ...shimmer, height: 10, width: "30%", marginBottom: 20 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
          <div style={{ ...shimmer, width: 36, height: 36, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ ...shimmer, height: 8, width: "25%", marginBottom: 10 }} />
            <div style={{ ...shimmer, height: 14, width: "55%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Stepper ───────────────────────────────────────────────────────────────────
const Stepper = ({ current }) => (
  <div className="co-stepper" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: "2rem", userSelect: "none" }}>
    {STEPS.map((label, i) => {
      const done = i < current, active = i === current;
      return (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div className="co-step-dot" style={{
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, border: "2px solid",
              borderColor: done || active ? "#a078ff" : "rgba(160,120,255,0.22)",
              background: done ? "#a078ff" : "transparent",
              color: done ? "#fff" : active ? "#a078ff" : "#8880aa",
              boxShadow: active ? "0 0 10px rgba(160,120,255,0.3)" : done ? "0 0 14px rgba(160,120,255,0.55)" : "none",
              transition: "all 0.3s",
            }}>
              {done ? <FiCheck size={14} /> : i + 1}
            </div>
            <span className="co-step-label" style={{ letterSpacing: "0.15em", textTransform: "uppercase", color: active ? "#a078ff" : done ? "rgba(160,120,255,0.7)" : "#8880aa" }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="co-step-line" style={{ height: 1, margin: "0 4px 16px", background: done ? "#a078ff" : "rgba(160,120,255,0.18)" }} />
          )}
        </div>
      );
    })}
  </div>
);

// ── Primitives ────────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div className="checkout-card" style={style}>
    {children}
  </div>
);

const Divider = () => <div style={{ height: 1, background: "rgba(160,120,255,0.10)", margin: "0.75rem 0" }} />;

const SecLabel = ({ children }) => (
  <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8880aa", marginBottom: 12 }}>{children}</div>
);

const FieldLabel = ({ children }) => (
  <div style={{ fontSize: 10, color: "#8880aa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{children}</div>
);

function StyledInput({ value, onValueChange, placeholder = "", type = "text", hasError = false, readOnly = false, autoComplete = "off" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || readOnly) return;
    const handleInput = () => { if (el.value !== value) onValueChange?.(el.value); };
    el.addEventListener("input", handleInput);
    return () => el.removeEventListener("input", handleInput);
  }, [value, onValueChange, readOnly]);

  return (
    <input
      ref={ref} type={type} value={value} autoComplete={autoComplete}
      onChange={(e) => onValueChange?.(e.target.value)}
      placeholder={placeholder} readOnly={readOnly}
      className="checkout-text-input"
      style={{
        width: "100%", boxSizing: "border-box", minWidth: 0,
        background: readOnly ? "rgba(255,255,255,0.03)" : "#0E1320",
        border: `1px solid ${hasError ? "rgba(239,68,68,0.6)" : "rgba(160,120,255,0.25)"}`,
        borderRadius: 12, padding: "0.6rem 1rem",
        color: readOnly ? "rgba(255,255,255,0.35)" : "#e8e0ff",
        outline: "none", transition: "border 0.2s",
        cursor: readOnly ? "not-allowed" : "auto",
      }}
      onFocus={(e) => { if (!readOnly && !hasError) e.target.style.borderColor = "#a078ff"; }}
      onBlur={(e) => { if (!readOnly) e.target.style.borderColor = hasError ? "rgba(239,68,68,0.6)" : "rgba(160,120,255,0.25)"; }}
    />
  );
}

const ErrorMsg = ({ msg }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#f87171" }}>
    <FiX size={12} /> {msg}
  </div>
);

const InfoRow = ({ icon, label, children }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14 }}>
    <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(160,120,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
function ChangeModal({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div onClick={(e) => e.stopPropagation()} className="checkout-modal" style={{ background: "#12121a", border: "1px solid rgba(160,120,255,0.28)", borderRadius: 24, width: "100%", maxWidth: 500, boxShadow: "0 0 60px rgba(160,120,255,0.25)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "#8880aa" }}>{title}</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(160,120,255,0.08)", border: "1px solid rgba(160,120,255,0.2)", color: "#a078ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiX size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Image Popup ───────────────────────────────────────────────────────────────
const ImagePopup = ({ src, alt, onClose }) => (
  <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 8000, background: "rgba(0,0,0,0.80)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.25rem" }}>
    <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", background: "#12121a", border: "1px solid rgba(160,120,255,0.28)", borderRadius: 20, padding: 12, width: "100%", maxWidth: 360, boxShadow: "0 0 60px rgba(160,120,255,0.3)" }}>
      <button onClick={onClose} style={{ position: "absolute", top: -14, right: -14, width: 32, height: 32, borderRadius: "50%", background: "#1a1730", border: "1px solid rgba(160,120,255,0.35)", color: "#a078ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
        <FiX size={15} />
      </button>
      <img src={src} alt={alt} style={{ width: "100%", maxHeight: "72vh", objectFit: "contain", borderRadius: 12 }} />
      <p style={{ textAlign: "center", fontSize: 10, color: "#8880aa", marginTop: 8, lineHeight: 1.4 }}>{alt}</p>
    </div>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="checkout-toast" style={{ position: "fixed", zIndex: 99999, display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", fontWeight: 600, backdropFilter: "blur(16px)", background: type === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", border: type === "success" ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(239,68,68,0.4)", color: type === "success" ? "#6ee7b7" : "#fca5a5", boxShadow: type === "success" ? "0 4px 24px rgba(16,185,129,0.2)" : "0 4px 24px rgba(239,68,68,0.2)" }}>
      {type === "success" ? <FiCheck size={15} /> : <FiX size={15} />}
      {message}
    </div>
  );
}

// ── Save Button ───────────────────────────────────────────────────────────────
const SaveBtn = ({ onClick, loading, label = "Save Changes" }) => (
  <button onClick={onClick} disabled={loading} style={{ width: "100%", padding: "0.75rem", borderRadius: 14, marginTop: "1rem", background: loading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg,#a078ff,#7c3aed)", border: "1px solid rgba(139,92,246,0.5)", color: "#fff", fontSize: "0.9rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 2px 20px rgba(124,58,237,0.4)", transition: "opacity 0.2s" }}>
    {loading ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.75s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> : <FiCheck size={15} />}
    {loading ? "Saving…" : label}
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </button>
);

// ── Voucher Box ───────────────────────────────────────────────────────────────
// Self-contained code-entry + apply/remove control for the Price Summary card.
// The input+button row uses the `.voucher-row` class so it can switch from
// a side-by-side row (≥380px) to a stacked column (very narrow phones) —
// inline styles can't respond to a media query on their own, which is what
// was causing the input to overflow/clip before.
function VoucherBox({ appliedVoucher, onApply, onRemove, applying, error, disabled }) {
  const [code, setCode] = useState("");

  const handleApply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onApply(trimmed);
  };

  if (appliedVoucher) {
    return (
      <div className="voucher-applied-row" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)",
        borderRadius: 12, padding: "0.65rem 0.9rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(74,222,128,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiTag size={13} color="#4ade80" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#4ade80", fontFamily: "monospace", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {appliedVoucher.discountId}
            </div>
            <div style={{ fontSize: 10.5, color: "#8880aa" }}>
              {appliedVoucher.discountLabel} applied
            </div>
          </div>
        </div>
        <button
          onClick={onRemove}
          style={{
            flexShrink: 0, display: "flex", alignItems: "center", gap: 4,
            background: "transparent", border: "1px solid rgba(239,68,68,0.35)",
            color: "#f87171", fontSize: 11, fontWeight: 600, padding: "5px 10px",
            borderRadius: 8, cursor: "pointer",
          }}
        >
          <FiX size={11} /> Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="voucher-row">
        <div className="voucher-input-wrap">
          <StyledInput
            value={code}
            placeholder="Have a voucher code? Enter it here"
            hasError={!!error}
            onValueChange={(v) => setCode(v.toUpperCase())}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={applying || !code.trim() || disabled}
          className="voucher-apply-btn"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            borderRadius: 12,
            background: applying || !code.trim() || disabled ? "rgba(160,120,255,0.15)" : "linear-gradient(135deg,#a078ff,#7c3aed)",
            border: "1px solid rgba(139,92,246,0.4)",
            color: applying || !code.trim() || disabled ? "#6b6490" : "#fff",
            fontWeight: 700,
            cursor: applying || !code.trim() || disabled ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {applying ? <FiLoader size={13} style={{ animation: "spin 0.75s linear infinite" }} /> : null}
          {applying ? "Checking…" : "Apply"}
        </button>
      </div>
      {error && <ErrorMsg msg={error} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ViewCheckout() {
  const navigate       = useNavigate();
  const { productId }  = useParams();
  const email          = getStoredEmail();

  // ── Session values from ProductView ───────────────────────────────────────
  const sessionSize = sessionStorage.getItem("selectedSize") || null;

  // ── Product state ──────────────────────────────────────────────────────────
  const [product,     setProduct]     = useState(null);
  const [productLoad, setProductLoad] = useState(true);
  const [imgPopup,    setImgPopup]    = useState(false);

  // ── User / address state ───────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState(null);
  const showToast = (message, type = "success") => setToast({ message, type });

  const [savedUser,    setSavedUser]    = useState(null);
  const [savedAddress, setSavedAddress] = useState(null);

  // Inline personal
  const [inlineUsername, setInlineUsername] = useState("");
  const [inlinePhone,    setInlinePhone]    = useState("");
  const [inlineAltPhone, setInlineAltPhone] = useState("");

  // Inline address
  const [inlineAddr, setInlineAddr] = useState({
    addressLine1: "", addressLine2: "", city: "",
    district: "", state: "", pincode: "", country: "India",
  });
  const setAddrField = useCallback((key, val) => {
    setInlineAddr((prev) => ({ ...prev, [key]: val }));
  }, []);

  // ── Modal state ────────────────────────────────────────────────────────────
  const [personalOpen,   setPersonalOpen]   = useState(false);
  const [addressOpen,    setAddressOpen]    = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress,  setSavingAddress]  = useState(false);
  const [draftPersonal,  setDraftPersonal]  = useState({});
  const [draftAddress,   setDraftAddress]   = useState({});

  // ── Qty (max 10) ───────────────────────────────────────────────────────────
  const [qty, setQty] = useState(() => {
    const stored = sessionStorage.getItem("selectedQty");
    return stored ? Math.min(10, Math.max(1, Number(stored))) : 1;
  });

  // Persist qty to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("selectedQty", String(qty));
  }, [qty]);

  // ── Voucher state ──────────────────────────────────────────────────────────
  // appliedVoucher holds the record returned by POST /discount/validateDiscount
  // once a code has been confirmed valid (discountId, discountLabel,
  // discountValue, etc.). This is a READ-ONLY check — the voucher is NOT
  // marked used yet. Clearing it (Remove) just stops applying it to the
  // price shown here; since nothing was mutated, the same code can be
  // re-applied freely. The voucher only actually gets spent when payment
  // succeeds, via /discount/consumeDiscount on the payment page — see
  // appliedVoucherId / appliedVoucherValue written to sessionStorage below.
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherApplying, setVoucherApplying] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  // ── Validation errors ──────────────────────────────────────────────────────
  const [errors,    setErrors]    = useState({});
  const [feesOpen,  setFeesOpen]  = useState(false);
  const clearError = useCallback((key) => setErrors((p) => { const n = { ...p }; delete n[key]; return n; }), []);

  // Fixed bottom bar
  const continueBtnRef = useRef(null);
  const [fixedBar, setFixedBar] = useState(false);
  useEffect(() => {
    const check = () => {
      if (!continueBtnRef.current) return;
      const r = continueBtnRef.current.getBoundingClientRect();
      setFixedBar(r.bottom < 0 || r.top > window.innerHeight);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [loading, productLoad]);

  // ── Fetch product ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!productId) { setProductLoad(false); return; }
    const fetchProduct = async () => {
      setProductLoad(true);
      try {
        const decodedId  = decodeURIComponent(productId);
        const bytes      = CryptoJS.AES.decrypt(decodedId, SECRET_KEY);
        const originalId = bytes.toString(CryptoJS.enc.Utf8);
        const res        = await API.get(`/productBuy/fetchProductById/${originalId}`);
        if (res.data.success) setProduct(res.data.data);
      } catch (err) {
        console.error(err.response?.data?.message || "Failed to fetch product");
      } finally {
        setProductLoad(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // ── Fetch profile ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!email) { setLoading(false); return; }
    try {
      const res = await API.post("/user/getProfile", { email });
      if (res.data.success) {
        const u = res.data.user    ?? {};
        const a = res.data.address ?? {};
        const userData = { username: u.username ?? "", email: u.email ?? email, phone: u.phone ?? "", altPhone: u.altPhone ?? "", gender: u.gender ?? "Prefer not to say" };
        const addrData = { addressLine1: a.addressLine1 ?? "", addressLine2: a.addressLine2 ?? "", city: a.city ?? "", district: a.district ?? "", state: a.state ?? "", pincode: a.pincode ?? "", country: a.country ?? "India" };
        setSavedUser(userData);
        setSavedAddress(addrData);
        setInlineUsername(userData.username);
        setInlinePhone(userData.phone);
        setInlineAltPhone(userData.altPhone);
        setInlineAddr(addrData);
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Could not load profile", "error");
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived product values ─────────────────────────────────────────────────
  const hasDiscount   = product && product.discount > 0 && product.finalPrice && product.finalPrice !== product.price;
  const productPrice  = product ? (hasDiscount ? product.finalPrice : product.price) : 0;
  const productOldPrice = product?.price ?? 0;
  const discountPct   = product?.discount ?? 0;

  // ── Derived user values ────────────────────────────────────────────────────
  const effectiveUsername = savedUser?.username?.trim() || inlineUsername;
  const effectivePhone    = savedUser?.phone?.trim()    || inlinePhone;
  const effectiveAltPhone = savedUser?.altPhone?.trim() || inlineAltPhone;

  const effectiveAddr = savedAddress
    ? Object.fromEntries(ADDR_FIELDS.map(({ key }) => [key, savedAddress[key]?.trim() ? savedAddress[key] : (inlineAddr[key] ?? "")]))
    : inlineAddr;

  const addrParts   = ADDR_FIELDS.filter(({ key }) => effectiveAddr[key]?.trim()).map(({ key }) => effectiveAddr[key]);
  const addrSummary = addrParts.join(", ");

  const emptyRequiredAddrFields = ADDR_FIELDS.filter(({ key, optional }) => !optional && !savedAddress?.[key]?.trim());
  const hasEmptyAddrFields      = emptyRequiredAddrFields.length > 0;
  const emptyOptionalAddrFields = ADDR_FIELDS.filter(({ key, optional }) => optional && !savedAddress?.[key]?.trim());

  // ── Price calcs ────────────────────────────────────────────────────────────
  // Voucher % is applied on top of the per-unit (already product-discounted)
  // price, then delivery is calculated off that voucher-adjusted price — so a
  // big enough voucher can push an order under/over the ₹699 free-delivery
  // line just like a product discount would.
  const subtotal = productPrice * qty;
  const savedAmt = (productOldPrice - productPrice) * qty;

  const voucherPct = appliedVoucher?.discountValue || 0;
  const voucherDiscountAmt = voucherPct > 0 ? Math.round(subtotal * (voucherPct / 100)) : 0;
  const priceAfterVoucher  = subtotal - voucherDiscountAmt;

  const deliveryCharge = calcDelivery(priceAfterVoucher / Math.max(qty, 1) || productPrice);
  const total = priceAfterVoucher + deliveryCharge;
  const totalSaved = savedAmt + voucherDiscountAmt;

  // Image URL helper
  const imageUrl = (path) =>
    path ? (path.startsWith("/") ? `${BASE_URL}${path}` : path) : null;
  const productImage = product?.images?.[0] ? imageUrl(product.images[0]) : null;

  // ── Open modals ────────────────────────────────────────────────────────────
  const openPersonal = () => {
    setDraftPersonal({ username: effectiveUsername, email: savedUser?.email ?? email, phone: effectivePhone, altPhone: effectiveAltPhone, gender: savedUser?.gender ?? "Prefer not to say" });
    setErrors({});
    setPersonalOpen(true);
  };
  const openAddress = () => {
    setDraftAddress({ ...effectiveAddr });
    setErrors({});
    setAddressOpen(true);
  };

  // ── Save personal ──────────────────────────────────────────────────────────
  const handleSavePersonal = async () => {
    if (!email) return;
    try {
      setSavingPersonal(true);
      const res = await API.post("/user/updateProfile", { email, username: draftPersonal.username, phone: draftPersonal.phone, altPhone: draftPersonal.altPhone, gender: draftPersonal.gender });
      if (res.data.success) {
        const u = res.data.user;
        const updated = { username: u.username ?? "", email: u.email ?? email, phone: u.phone ?? "", altPhone: u.altPhone ?? "", gender: u.gender ?? "Prefer not to say" };
        setSavedUser(updated);
        setInlineUsername(updated.username);
        setInlinePhone(updated.phone);
        setInlineAltPhone(updated.altPhone);
        setPersonalOpen(false);
        showToast("Personal details updated 🎉");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update", "error");
    } finally {
      setSavingPersonal(false);
    }
  };

  // ── Save address ───────────────────────────────────────────────────────────
  const handleSaveAddress = async () => {
    if (!email) return;
    try {
      setSavingAddress(true);
      const res = await API.post("/user/updateAddress", { email, ...draftAddress });
      if (res.data.success) {
        const a = res.data.address;
        const updated = { addressLine1: a.addressLine1 ?? "", addressLine2: a.addressLine2 ?? "", city: a.city ?? "", district: a.district ?? "", state: a.state ?? "", pincode: a.pincode ?? "", country: a.country ?? "India" };
        setSavedAddress(updated);
        setInlineAddr(updated);
        setAddressOpen(false);
        showToast("Address updated 🎉");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update address", "error");
    } finally {
      setSavingAddress(false);
    }
  };

  // ── Apply voucher ──────────────────────────────────────────────────────────
  // Calls POST /discount/validateDiscount — a READ-ONLY check. It confirms
  // the code is valid and tells us the discount value, but does NOT mark the
  // voucher used. The voucher only actually gets spent (isUsed: true) once
  // payment succeeds, via /discount/consumeDiscount called from the payment
  // page. That means if someone applies a code here and then abandons
  // checkout, the voucher is untouched and still usable later.
  const handleApplyVoucher = async (code) => {
    if (!email) {
      setVoucherError("Please log in to use a voucher.");
      return;
    }
    setVoucherApplying(true);
    setVoucherError("");
    try {
      const res = await API.post("/discount/validateDiscount", {
        discountId: code,
        userEmail: email,
      });
      if (res.data.success) {
        setAppliedVoucher(res.data.voucher);
        showToast(`Voucher ${code} applied 🎉`);
      } else {
        setVoucherError(res.data.message || "Could not apply this voucher.");
      }
    } catch (err) {
      setVoucherError(err.response?.data?.message || "Invalid or expired voucher code.");
    } finally {
      setVoucherApplying(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError("");
  };

  // ── Continue to Payment ────────────────────────────────────────────────────
  const handleContinue = async () => {
    const finalUsername = effectiveUsername.trim();
    const finalPhone    = effectivePhone.trim();
    const finalAltPhone = effectiveAltPhone.trim();

    const errs = {};
    if (!finalUsername)                                          errs.username = "Name is required";
    if (!finalPhone)                                             errs.phone    = "Mobile number is required";
    if (!finalAltPhone || finalAltPhone.replace(/\D/g,"").length < 10)
                                                                 errs.altPhone = "A valid 10-digit alternative number is required";
    ADDR_FIELDS.forEach(({ key, optional }) => {
      if (!optional && !effectiveAddr[key]?.trim()) errs[key] = `${ADDR_FIELDS.find(f => f.key === key)?.label} is required`;
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);

      const personalChanged = finalUsername !== savedUser?.username || finalPhone !== savedUser?.phone || finalAltPhone !== savedUser?.altPhone;
      if (personalChanged) {
        const pRes = await API.post("/user/updateProfile", { email, username: finalUsername, phone: finalPhone, altPhone: finalAltPhone, gender: savedUser?.gender ?? "Prefer not to say" });
        if (pRes.data.success) {
          const u = pRes.data.user;
          setSavedUser({ username: u.username ?? "", email: u.email ?? email, phone: u.phone ?? "", altPhone: u.altPhone ?? "", gender: u.gender ?? "Prefer not to say" });
        }
      }

      const addrChanged = ADDR_FIELDS.some(({ key }) => effectiveAddr[key] !== savedAddress?.[key]);
      if (addrChanged) {
        const aRes = await API.post("/user/updateAddress", { email, ...effectiveAddr });
        if (aRes.data.success) {
          const a = aRes.data.address;
          setSavedAddress({ addressLine1: a.addressLine1 ?? "", addressLine2: a.addressLine2 ?? "", city: a.city ?? "", district: a.district ?? "", state: a.state ?? "", pincode: a.pincode ?? "", country: a.country ?? "India" });
        }
      }

      // Store qty, size & voucher for the next page
      sessionStorage.setItem("selectedQty",  String(qty));
      sessionStorage.setItem("selectedSize", sessionSize || "");
      if (appliedVoucher) {
        sessionStorage.setItem("appliedVoucherId", appliedVoucher.discountId);
        sessionStorage.setItem("appliedVoucherLabel", appliedVoucher.discountLabel);
        sessionStorage.setItem("appliedVoucherValue", String(appliedVoucher.discountValue));
      } else {
        sessionStorage.removeItem("appliedVoucherId");
        sessionStorage.removeItem("appliedVoucherLabel");
        sessionStorage.removeItem("appliedVoucherValue");
      }

      navigate(`/view-payment/${encodeURIComponent(productId)}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not save details. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const changeBtn = {
    display: "flex", alignItems: "center", gap: 6,
    fontSize: 12, fontWeight: 600, color: "#a078ff",
    border: "1px solid rgba(160,120,255,0.3)",
    padding: "0.3rem 0.85rem", borderRadius: 10,
    background: "transparent", cursor: "pointer", transition: "all 0.2s",
  };

  const isPageLoading = loading || productLoad;

  if (!email && !loading) return (
    <div style={{ minHeight: "100vh", background: "#0E1320", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#f87171", fontSize: 14, padding: "0 1.25rem", textAlign: "center" }}>⚠️ No session found. Please <a href="/login" style={{ color: "#f87171" }}>log in</a> again.</div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
        <Helmet>
      <title>Checkout | ChomokTomok</title>

      <meta
        name="description"
        content="Secure checkout at ChomokTomok. Review your order, shipping details, and complete your purchase safely."
      />

      <meta name="robots" content="noindex,nofollow" />

      <link
        rel="canonical"
        href="https://chomoktomok.com/view-checkout"
      />

      <meta property="og:title" content="Checkout | ChomokTomok" />
      <meta
        property="og:description"
        content="Secure checkout at ChomokTomok."
      />
      <meta
        property="og:image"
        content="https://chomoktomok.com/Images/chomoktomok-og.png"
      />
    </Helmet>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *{box-sizing:border-box} body{margin:0} input{outline:none}
        html, body { overflow-x: hidden; }
        ::-webkit-scrollbar{width:2px;height:2px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(160,120,255,0.22);border-radius:2px}
        .cinzel{font-family:'Cinzel',serif}
           
        /* ── Base mobile-first sizing ───────────────────────────────────── */
        .checkout-page-inner { max-width: 1100px; margin: 0 auto; padding: 1.25rem 0.85rem 0; }
        .checkout-card { background:#12121a; border:1px solid rgba(160,120,255,0.13); border-radius:16px; padding: 1rem 1.1rem; min-width:0; overflow: hidden; }
        .checkout-text-input { font-size: 0.95rem; }
        .checkout-modal { padding: 1.25rem; }
        .checkout-toast { top: 1rem; right: 1rem; left: 1rem; font-size: 0.8rem; padding: 0.65rem 1rem; }

        .co-stepper { gap: 0; }
        .co-step-dot { width: 28px; height: 28px; font-size: 11px; }
        .co-step-label { font-size: 8.5px; }
        .co-step-line { width: 28px; }

        /* Voucher input + apply button: stacked on the smallest phones so
           the input never gets squeezed/clipped, side-by-side from 380px up. */
        .voucher-row { display: flex; flex-direction: column; gap: 8px; }
        .voucher-input-wrap { flex: 1; min-width: 0; }
        .voucher-apply-btn { width: 100%; padding: 0.65rem 0; font-size: 13px; }
        .voucher-applied-row { flex-wrap: wrap; }

        /* Trust badges: 3-up grid still works at any width, just tighten
           gutters/text on the smallest phones. */
        .trust-badges-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; text-align:center; }
        .trust-badge-card { background:#12121a; border:1px solid rgba(160,120,255,0.10); border-radius:12px; padding:0.55rem 0.3rem; display:flex; flex-direction:column; align-items:center; gap:5px; min-width:0; }
        .trust-badge-label { font-size: 8px; color:#8880aa; line-height:1.25; }

        .continue-btn { padding: 0.9rem 0; font-size: 14px; border-radius: 16px; }

        /* ── ≥380px: small phones, room for side-by-side voucher row ────── */
        @media (min-width: 380px) {
          .voucher-row { flex-direction: row; gap: 8px; }
          .voucher-apply-btn { width: auto; padding: 0 1.1rem; flex-shrink: 0; }
          .trust-badge-label { font-size: 9px; }
        }

        /* ── ≥480px: large phones ────────────────────────────────────────── */
        @media (min-width: 480px) {
          .checkout-page-inner { padding: 1.5rem 1rem 0; }
          .checkout-card { padding: 1.1rem 1.3rem; border-radius: 18px; }
          .co-step-dot { width: 30px; height: 30px; font-size: 12px; }
          .co-step-label { font-size: 9.5px; }
          .co-step-line { width: 48px; }
          .continue-btn { padding: 1rem 0; font-size: 15px; border-radius: 18px; }
          .trust-badges-grid { gap: 8px; }
          .trust-badge-card { padding: 0.6rem 0.4rem; }
        }

        /* ── ≥641px: tablet / matches the existing JS isMobile threshold ── */
        @media (min-width: 641px) {
          .checkout-page-inner { padding: 2rem 1rem 0; }
          .checkout-card { padding: 1.25rem 1.5rem; border-radius: 20px; }
          .co-step-dot { width: 32px; height: 32px; font-size: 13px; }
          .co-step-label { font-size: 10px; }
          .co-step-line { width: 64px; }
        }

        /* ── ≥1024px: desktop two-column grid (unchanged) ────────────────── */
        @media(min-width:1024px){.checkout-grid{grid-template-columns:1fr 360px !important}}

        @keyframes sk-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {imgPopup && productImage && (
        <ImagePopup src={productImage} alt={product?.name} onClose={() => setImgPopup(false)} />
      )}

      {/* ── Personal Modal ── */}
      {personalOpen && (
        <ChangeModal title="Edit Personal Details" onClose={() => setPersonalOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { key: "username", label: "Username",          type: "text", placeholder: "Your name",                   ac: "name" },
              { key: "phone",    label: "Phone Number",      type: "tel",  placeholder: "10-digit mobile",             ac: "tel" },
              { key: "altPhone", label: "Alternative Phone", type: "tel",  placeholder: "10-digit alternative number", ac: "tel" },
            ].map(({ key, label, type, placeholder, ac }) => (
              <div key={key}>
                <FieldLabel>{label}</FieldLabel>
                <StyledInput type={type} value={draftPersonal[key] ?? ""} placeholder={placeholder} autoComplete={ac}
                  onValueChange={(v) => setDraftPersonal((p) => ({ ...p, [key]: v }))} />
              </div>
            ))}
            <div>
              <FieldLabel>Email Address <span style={{ color: "#8880aa", fontSize: 10 }}>(locked)</span></FieldLabel>
              <StyledInput value={draftPersonal.email ?? ""} readOnly autoComplete="email" onValueChange={() => {}} />
            </div>
            <div>
              <FieldLabel>Gender</FieldLabel>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
                {["Male", "Female", "Prefer not to say"].map((opt) => (
                  <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", color: "#e8e0ff" }}>
                    <input type="radio" name="gender-modal" value={opt} checked={draftPersonal.gender === opt}
                      onChange={() => setDraftPersonal((p) => ({ ...p, gender: opt }))}
                      style={{ appearance: "none", WebkitAppearance: "none", width: 18, height: 18, borderRadius: "50%", border: draftPersonal.gender === opt ? "5px solid #7c3aed" : "2px solid rgba(255,255,255,0.5)", background: "#fff", cursor: "pointer", transition: "all 0.2s" }} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <SaveBtn onClick={handleSavePersonal} loading={savingPersonal} />
          </div>
        </ChangeModal>
      )}

      {/* ── Address Modal ── */}
      {addressOpen && (
        <ChangeModal title="Edit Delivery Address" onClose={() => setAddressOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {ADDR_FIELDS.map(({ key, label, placeholder, optional, autoComplete: ac }) => (
              <div key={key}>
                <FieldLabel>{label}{optional && <span style={{ color: "#555", marginLeft: 4 }}>(optional)</span>}</FieldLabel>
                <StyledInput value={draftAddress[key] ?? ""} placeholder={placeholder || label} hasError={!!errors[key]} autoComplete={ac}
                  onValueChange={(v) => setDraftAddress((p) => ({ ...p, [key]: v }))} />
                {errors[key] && <ErrorMsg msg={errors[key]} />}
              </div>
            ))}
            <SaveBtn onClick={handleSaveAddress} loading={savingAddress} label="Save Address" />
          </div>
        </ChangeModal>
      )}

      <div style={{ minHeight: "100vh", background: "#0E1320", color: "#e8e0ff", paddingBottom: 112, fontFamily: "'Raleway', sans-serif", overflowX: "hidden" }}>
        <div className="checkout-page-inner">
          <Stepper current={1} />

          <div className="checkout-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.25rem", minWidth: 0 }}>

            {/* ════════ LEFT ════════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", minWidth: 0 }}>

              {/* ── Delivery Details Card ── */}
              {isPageLoading ? <SkeletonCard rows={5} /> : (
                <Card>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: 8, flexWrap: "wrap" }}>
                    <SecLabel>Delivery Details</SecLabel>
                    <button style={changeBtn} onClick={openPersonal}><FiEdit2 size={12} /> Change Details</button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                    {/* Name */}
                    <InfoRow icon={<FiUser size={15} color="#a078ff" />} label="Name">
                      {savedUser?.username?.trim() ? (
                        <div style={{ color: "#e8e0ff", fontWeight: 600 }}>{savedUser.username}</div>
                      ) : (
                        <>
                          <StyledInput value={inlineUsername} placeholder="Enter your name" hasError={!!errors.username} autoComplete="name"
                            onValueChange={(v) => { setInlineUsername(v); clearError("username"); }} />
                          {errors.username && <ErrorMsg msg={errors.username} />}
                        </>
                      )}
                    </InfoRow>

                    {/* Mobile */}
                    <InfoRow icon={<FiPhone size={15} color="#a078ff" />} label="Mobile">
                      {savedUser?.phone?.trim() ? (
                        <div style={{ color: "#e8e0ff", fontWeight: 600 }}>{savedUser.phone}</div>
                      ) : (
                        <>
                          <StyledInput type="tel" value={inlinePhone} placeholder="10-digit mobile" hasError={!!errors.phone} autoComplete="tel"
                            onValueChange={(v) => { setInlinePhone(v); clearError("phone"); }} />
                          {errors.phone && <ErrorMsg msg={errors.phone} />}
                        </>
                      )}
                    </InfoRow>

                    {/* Alternative Mobile */}
                    <InfoRow icon={<FiPhone size={15} color="#a078ff" />} label="Alternative Mobile">
                      {savedUser?.altPhone?.trim() ? (
                        <div style={{ color: "#e8e0ff", fontWeight: 600 }}>{savedUser.altPhone}</div>
                      ) : (
                        <>
                          <StyledInput type="tel" value={inlineAltPhone} placeholder="Enter 10-digit alternative number" hasError={!!errors.altPhone} autoComplete="tel"
                            onValueChange={(v) => { setInlineAltPhone(v); clearError("altPhone"); }} />
                          {errors.altPhone && <ErrorMsg msg={errors.altPhone} />}
                        </>
                      )}
                    </InfoRow>

                    {/* Email */}
                    <InfoRow icon={<MdEmail size={16} color="#a078ff" />} label="Email">
                      <div style={{ color: "#e8e0ff", fontWeight: 600, overflowWrap: "anywhere" }}>{savedUser?.email}</div>
                    </InfoRow>

                    <Divider />

                    {/* Delivery Address */}
                    <InfoRow icon={<RiMapPin2Fill size={16} color="#a078ff" />} label="Delivery Address">
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {addrSummary ? (
                            <div style={{ color: "#e8e0ff", fontWeight: 500, lineHeight: 1.6, fontSize: 14, marginBottom: hasEmptyAddrFields ? "0.75rem" : 0, overflowWrap: "anywhere" }}>
                              {addrSummary}
                            </div>
                          ) : (
                            <div style={{ color: "#8880aa", fontSize: 13, marginBottom: "0.75rem" }}>
                              Please fill in your delivery address below.
                            </div>
                          )}
                        </div>
                        {addrSummary && (
                          <button style={{ ...changeBtn, flexShrink: 0 }} onClick={openAddress}><FiEdit2 size={12} /> Change</button>
                        )}
                      </div>
                    </InfoRow>

                    {(hasEmptyAddrFields || emptyOptionalAddrFields.length > 0) && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                        {emptyRequiredAddrFields.map(({ key, label, placeholder, autoComplete: ac }) => (
                          <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ width: 36, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <FieldLabel>{label}</FieldLabel>
                              <StyledInput value={inlineAddr[key] ?? ""} placeholder={placeholder || label} hasError={!!errors[key]} autoComplete={ac}
                                onValueChange={(v) => { setAddrField(key, v); clearError(key); }} />
                              {errors[key] && <ErrorMsg msg={errors[key]} />}
                            </div>
                          </div>
                        ))}
                        {emptyOptionalAddrFields.map(({ key, label, placeholder, autoComplete: ac }) => (
                          <div key={key} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ width: 36, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <FieldLabel>{label} <span style={{ color: "#555" }}>(optional)</span></FieldLabel>
                              <StyledInput value={inlineAddr[key] ?? ""} placeholder={placeholder || label} autoComplete={ac}
                                onValueChange={(v) => setAddrField(key, v)} />
                            </div>
                          </div>
                        ))}
                        {!addrSummary && (
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 36, flexShrink: 0 }} />
                            <button onClick={openAddress} style={{ display: "flex", alignItems: "center", gap: 6, padding: "0.45rem 1.1rem", borderRadius: 10, background: "rgba(160,120,255,0.08)", border: "1px solid rgba(160,120,255,0.3)", color: "#a078ff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              <FiEdit2 size={12} /> Edit Full Address
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* ── Order Items ── */}
              {isPageLoading ? <SkeletonCard rows={2} /> : (
                <Card>
                  <SecLabel>Order Items</SecLabel>
                  <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", minWidth: 0 }}>

                    {/* Product image */}
                    <button
                      onClick={() => productImage && setImgPopup(true)}
                      style={{ width: 76, height: 76, borderRadius: 14, background: "#0E1320", border: "1px solid rgba(160,120,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", cursor: productImage ? "pointer" : "default", transition: "all 0.3s" }}
                      onMouseEnter={(e) => { if (productImage) { e.currentTarget.style.borderColor = "#a078ff"; e.currentTarget.style.boxShadow = "0 0 14px rgba(160,120,255,0.3)"; }}}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(160,120,255,0.18)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      {productImage
                        ? <img src={productImage} alt={product?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#8880aa", fontSize: 10 }}>No Image</div>
                      }
                    </button>

                    {/* Product info */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e8e0ff", lineHeight: 1.4, fontFamily: "'Poppins', sans-serif" }}>
                        {product?.name}
                      </div>

                      {/* Rating row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ color: "#facc15", fontSize: 12 }}>{"★".repeat(4)}☆</span>
                        <span style={{ fontSize: 11, color: "#8880aa" }}>4.3 · (2,841)</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#a078ff", background: "rgba(160,120,255,0.12)", padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(160,120,255,0.22)", display: "flex", alignItems: "center", gap: 3 }}>
                          <BsTagFill size={8} /> Best Seller
                        </span>
                      </div>

                      {/* Price row */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: "#17ec03", fontFamily: "'Poppins', sans-serif" }}>{fmt(productPrice)}</span>
                        {hasDiscount && (
                          <>
                            <span style={{ fontSize: 12, color: "#8880aa", textDecoration: "line-through" }}>{fmt(productOldPrice)}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "2px 8px", borderRadius: 999, display: "flex", alignItems: "center", gap: 3 }}>
                              <MdDiscount size={11} /> {discountPct}% OFF
                            </span>
                          </>
                        )}
                      </div>

                      {/* Size — from sessionStorage */}
                      {sessionSize && (
                        <span style={{ fontSize: 10, color: "#8880aa", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          Size — {sessionSize}
                        </span>
                      )}

                      {/* Qty stepper (max 10) */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: "#8880aa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Qty</span>
                        <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(160,120,255,0.25)", borderRadius: 12, overflow: "hidden" }}>
                          <button
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: qty <= 1 ? "#3a3456" : "#a078ff", background: "transparent", border: "none", cursor: qty <= 1 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700 }}
                          >−</button>
                          <span style={{ padding: "0 12px", fontSize: 14, fontWeight: 600, color: "#e8e0ff" }}>{qty}</span>
                          <button
                            onClick={() => setQty((q) => Math.min(10, q + 1))}
                            style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: qty >= 10 ? "#3a3456" : "#a078ff", background: "transparent", border: "none", cursor: qty >= 10 ? "not-allowed" : "pointer", fontSize: 18, fontWeight: 700 }}
                          >+</button>
                        </div>
                        {qty >= 10 && (
                          <span style={{ fontSize: 10, color: "#f87171" }}>Max 10</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Delivery row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, flexWrap: "wrap" }}>
                    <MdDeliveryDining size={22} color="#a078ff" style={{ flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <FieldLabel>Estimated Delivery</FieldLabel>
                      <div style={{ color: "#e8e0ff", fontWeight: 500 }}>
                        <span style={{ color: "#4ade80", fontWeight: 700 }}>{product?.delivery || "3–5 Business Days"}</span>
                        {" — "}
                        <span style={{ color: deliveryCharge === 0 ? "#4ade80" : "#e8e0ff", fontSize: 12, fontWeight: 700 }}>
                          {deliveryCharge === 0 ? "FREE Delivery" : `Delivery Charge : ${fmt(deliveryCharge)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
            {/* ════════ END LEFT ════════ */}

            {/* ════════ RIGHT ════════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: 0 }}>

              {/* ── Voucher Card ── */}
              {!isPageLoading && (
                <Card>
<div
  className="voucher-title"
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,

    padding: "8px 16px",

    background: "rgba(74,222,128,0.12)",
    border: "1px solid rgba(74,222,128,0.4)",
    borderRadius: "999px",

    color: "#4ade80",

    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",

    boxShadow: "0 0 12px rgba(74,222,128,0.15)",
  }}
>
  <span
    style={{
      background: "#22c55e",
      color: "#fff",
      fontSize: 9,
      fontWeight: 700,
      padding: "3px 7px",
      borderRadius: 999,
      letterSpacing: "0.08em",
    }}
  >
    SAVE
  </span>

  <FiTag size={13} />
  Apply Voucher
</div>
                  <VoucherBox
                    appliedVoucher={appliedVoucher}
                    onApply={handleApplyVoucher}
                    onRemove={handleRemoveVoucher}
                    applying={voucherApplying}
                    error={voucherError}
                  />
                </Card>
              )}

              {isPageLoading ? <SkeletonCard rows={4} /> : (
                <Card>
                  <SecLabel>Price Summary</SecLabel>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: 14 }}>

                    {/* MRP */}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ color: "#8880aa" }}>MRP{qty > 1 ? ` (×${qty})` : ""}</span>
                      <span style={{ color: "#e8e0ff", fontWeight: 500 }}>{fmt(productOldPrice * qty)}</span>
                    </div>

                    {/* Product Discount */}
                    {hasDiscount && (
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ color: "#8880aa", display: "flex", alignItems: "center", gap: 4 }}>
                          <MdDiscount size={13} color="#4ade80" /> Discount ({discountPct}%)
                        </span>
                        <span style={{ color: "#4ade80", fontWeight: 600, flexShrink: 0 }}>− {fmt(savedAmt)}</span>
                      </div>
                    )}

                    {/* Voucher Discount */}
                    {appliedVoucher && voucherDiscountAmt > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ color: "#8880aa", display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                          <FiTag size={12} color="#4ade80" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            Voucher ({appliedVoucher.discountLabel})
                          </span>
                        </span>
                        <span style={{ color: "#4ade80", fontWeight: 600, flexShrink: 0 }}>− {fmt(voucherDiscountAmt)}</span>
                      </div>
                    )}

                    {/* Delivery & Fees — expandable */}
                    <div>
                      <button
                        onClick={() => setFeesOpen((p) => !p)}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", background: "transparent", border: "none", color: "#8880aa", cursor: "pointer", fontSize: 14, gap: 8 }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <MdDeliveryDining size={14} /> Delivery Charge &amp; Fees {feesOpen ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
                        </span>
                        <span style={{ color: deliveryCharge === 0 ? "#4ade80" : "#e8e0ff", fontWeight: 600, flexShrink: 0 }}>
                          {deliveryCharge === 0 ? "FREE" : fmt(deliveryCharge)}
                        </span>
                      </button>

                      {feesOpen && (
                        <div style={{ marginTop: 8, background: "#0E1320", border: "1px solid rgba(160,120,255,0.13)", borderRadius: 12, padding: "0.6rem 0.9rem", fontSize: 12, color: "#8880aa", lineHeight: 2 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Shipping</span>
                            <span style={{ color: deliveryCharge === 0 ? "#4ade80" : "#e8e0ff" }}>
                              {deliveryCharge === 0 ? "FREE" : fmt(deliveryCharge)}
                            </span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span>Platform fee</span>
                            <span>₹0</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Divider />

                    {/* Total */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#e8e0ff", fontWeight: 600, fontSize: 15 }}>Total Amount</span>
                      <span className="cinzel" style={{ fontSize: 22, fontWeight: 700, color: "#17ec03" }}>{fmt(total)}</span>
                    </div>

                    {totalSaved > 0 && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, color: "#4ade80", background: "rgba(74,222,128,0.08)", borderRadius: 10, padding: "0.5rem", textAlign: "center" }}>
                        <FiTag size={11} style={{ flexShrink: 0 }} /> You save {fmt(totalSaved)} on this order!
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* ── Continue Button ── */}
              <div ref={continueBtnRef}>
                {!isPageLoading && (
                  <button
                    onClick={handleContinue}
                    disabled={saving}
                    className="continue-btn"
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: "none", background: saving ? "rgba(255,214,0,0.5)" : "linear-gradient(135deg,#FFE51F,#FFD600)", color: "#111827", fontWeight: 700, letterSpacing: "0.03em", boxShadow: "0 0 24px rgba(255,229,31,0.35)", cursor: saving ? "not-allowed" : "pointer", transition: "all 0.3s", fontFamily: "'Poppins', sans-serif" }}
                    onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.boxShadow = "0 0 36px rgba(255,229,31,0.55)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(255,229,31,0.35)"; e.currentTarget.style.transform = "none"; }}
                  >
                    {saving
                      ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.75s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Saving…</>
                      : <><IoIosFlash size={22} /> Continue to Payment</>
                    }
                  </button>
                )}
              </div>

              {/* Trust badges */}
              {!isPageLoading && (
                <div className="trust-badges-grid">
                  {[
                    { icon: <BsShieldLockFill  size={18} color="#a078ff" />, label: "Secure Payment"  },
                    { icon: <BsArrowReturnLeft size={18} color="#a078ff" />, label: "Easy Returns"    },
                    { icon: <BsPatchCheckFill  size={18} color="#a078ff" />, label: "Verified Seller" },
                  ].map((b, i) => (
                    <div key={i} className="trust-badge-card">
                      {b.icon}
                      <span className="trust-badge-label">{b.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* ════════ END RIGHT ════════ */}

          </div>
        </div>

        {/* ── Fixed bottom bar (mobile) ── */}
        <div
          className="block md:hidden"
          style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, padding: "0.75rem 1rem", background: "rgba(14,19,32,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(160,120,255,0.12)", transition: "transform 0.3s ease-in-out", transform: fixedBar ? "translateY(0)" : "translateY(100%)" }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "#8880aa", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</div>
                <div className="cinzel" style={{ fontSize: 20, fontWeight: 700, color: "#17ec03" }}>{fmt(total)}</div>
              </div>
              {totalSaved > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: "4px 10px", borderRadius: 999, flexShrink: 0, whiteSpace: "nowrap" }}>
                  <FiTag size={11} /> Save {fmt(totalSaved)}
                </div>
              )}
            </div>
            <button
              onClick={handleContinue}
              disabled={saving}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0.875rem", borderRadius: 14, border: "none", background: saving ? "rgba(255,214,0,0.5)" : "linear-gradient(135deg,#FFE51F,#FFD600)", color: "#111827", fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Poppins', sans-serif" }}
            >
              {saving
                ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.75s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg> Saving…</>
                : <><IoIosFlash size={20} /> Continue to Payment</>
              }
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}