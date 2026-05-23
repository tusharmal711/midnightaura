import { useState } from "react";

// ── All icons from react-icons ────────────────────────────────────────────────
import { IoIosFlash }                               from "react-icons/io";
import { MdDeliveryDining, MdDiscount, MdEmail }    from "react-icons/md";
import {
  FiEdit2, FiChevronDown, FiChevronUp,
  FiX, FiCheck, FiArrowLeft, FiUser,
  FiPhone, FiMapPin, FiTag, FiZoomIn,
} from "react-icons/fi";
import {
  BsShieldLockFill, BsArrowReturnLeft,
  BsPatchCheckFill, BsTagFill,
} from "react-icons/bs";
import { RiMapPin2Fill } from "react-icons/ri";

import { useNavigate } from "react-router-dom";
import tshirt9 from "../../assets/images/products/tshirt9.png";

// ── Static data ───────────────────────────────────────────────────────────────
const USER = {
  name:      "Tushar Mal",
  mobile:    "9641539527",
  altMobile: "",
  email:     "tushar.mal@example.com",
  address: {
    tag:   "HOME",
    line1: "Udaynarayan pur, Udaynarayanpur, Pearapur,",
    line2: "Pearapur, South Mal Para, Haora District 711226",
  },
};

const PRODUCT = {
  name:           "Canon PIXMA G3470 All-in-One Wi-Fi Ink Tank Colour Printer",
  image:          tshirt9,
  price:          8299,
  oldPrice:       12495,
  discountPct:    33,
  deliveryCharge: 0,
  deliveryDate:   "Tomorrow by 11 PM",
  badge:          "Best Seller",
  rating:         4.3,
  ratingCount:    "2,841",
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
const Card       = ({ children, className = "" }) => (
  <div className={`bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-2xl px-5 py-4 ${className}`}>
    {children}
  </div>
);
const Divider    = () => <div className="h-px bg-[rgba(160,120,255,0.10)] my-3" />;
const SecLabel   = ({ children }) => (
  <div className="text-[10px] tracking-[0.15em] uppercase text-[#8880aa] mb-2.5">{children}</div>
);
const FieldLabel = ({ children }) => (
  <div className="text-[10px] text-[#8880aa] uppercase tracking-widest mb-1">{children}</div>
);
const TextInput  = ({ value, onChange, placeholder = "", type = "text", hasError = false }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full bg-[#0E1320] border rounded-xl px-3 py-2.5 text-sm text-[#e8e0ff]
      placeholder-[#5a5478] transition-all
      focus:shadow-[0_0_10px_rgba(160,120,255,0.2)]
      ${hasError
        ? "border-red-500/60 focus:border-red-400"
        : "border-[rgba(160,120,255,0.25)] focus:border-[#a078ff]"}`}
  />
);

// ── Image popup ───────────────────────────────────────────────────────────────
const ImagePopup = ({ src, alt, onClose }) => (
  <div
    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm px-5"
    onClick={onClose}
  >
    <div
      className="relative bg-[#12121a] border border-[rgba(160,120,255,0.28)] rounded-2xl p-3 w-full max-w-sm shadow-[0_0_60px_rgba(160,120,255,0.3)]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute -top-3.5 -right-3.5 w-8 h-8 rounded-full bg-[#1a1730] border border-[rgba(160,120,255,0.35)] flex items-center justify-center text-[#a078ff] hover:bg-[rgba(160,120,255,0.18)] transition-all z-10"
      >
        <FiX size={15} />
      </button>
      <img src={src} alt={alt} className="w-full max-h-[72vh] object-contain rounded-xl" />
      <p className="text-center text-[10px] text-[#8880aa] mt-2 leading-snug line-clamp-2">{alt}</p>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
export default function ViewCheckout() {
  const navigate = useNavigate();

  const [qty,      setQty]      = useState(1);
  const [feesOpen, setFeesOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [imgPopup, setImgPopup] = useState(false);
  const [user,     setUser]     = useState(USER);
  const [draft,    setDraft]    = useState({ ...USER, address: { ...USER.address } });

  // ── altMobile error state — triggered only on "Continue to Payment" click ──
  const [altErr, setAltErr] = useState(false);

  const subtotal = PRODUCT.price * qty;
  const delivery = PRODUCT.deliveryCharge;
  const total    = subtotal + delivery;
  const saved    = (PRODUCT.oldPrice - PRODUCT.price) * qty;

  // helpers
  const openEdit = () => {
    setDraft({ ...user, address: { ...user.address } });
    setAltErr(false);
    setEditMode(true);
  };
  const setAddr  = (k, v) => setDraft((p) => ({ ...p, address: { ...p.address, [k]: v } }));
  const setField = (k, v) => { setDraft((p) => ({ ...p, [k]: v })); if (k === "altMobile") setAltErr(false); };

  // Save address — no alt-mobile validation here
  const handleSave = () => {
    setUser({ ...draft });
    setEditMode(false);
  };

  // Continue to Payment — validate alt mobile here
  const handleContinue = () => {
    const digits = user.altMobile?.trim().replace(/\D/g, "") || "";
    if (digits.length < 10) {
      setAltErr(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate("/view-payment");
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Raleway:wght@300;400;500;600&family=Poppins:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0E1320; }
        ::-webkit-scrollbar-thumb { background: rgba(160,120,255,0.28); border-radius: 4px; }
        .cinzel { font-family: 'Cinzel', serif; }
        body { margin: 0; }
        input { outline: none; }
      `}</style>

      {imgPopup && (
        <ImagePopup
          src={PRODUCT.image}
          alt={PRODUCT.name}
          onClose={() => setImgPopup(false)}
        />
      )}

      <div
        className="min-h-screen bg-[#0E1320] text-[#e8e0ff] pb-28 lg:pb-12"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >

        

        <div className="max-w-6xl mx-auto px-4 pt-8">
          <Stepper current={1} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ════════════ LEFT ════════════ */}
            <div className="flex flex-col gap-5">

              {/* ── Delivery Details ── */}
              <Card>
                <div className="mb-4">
                  <SecLabel>Delivery Details</SecLabel>
                </div>

                {/* ── VIEW mode ── */}
                {!editMode && (
                  <div className="flex flex-col gap-3.5">

                    {/* Name */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-xl bg-[rgba(160,120,255,0.1)] flex items-center justify-center shrink-0">
                        <FiUser size={15} className="text-[#a078ff]" />
                      </div>
                      <div>
                        <FieldLabel>Name</FieldLabel>
                        <div className="text-[#e8e0ff] font-medium">{user.name}</div>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-xl bg-[rgba(160,120,255,0.1)] flex items-center justify-center shrink-0">
                        <FiPhone size={15} className="text-[#a078ff]" />
                      </div>
                      <div>
                        <FieldLabel>Mobile</FieldLabel>
                        <div className="text-[#e8e0ff] font-medium">{user.mobile}</div>
                      </div>
                    </div>

                    {/* Alt mobile — always visible, inline editable */}
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-8 h-8 rounded-xl bg-[rgba(160,120,255,0.1)] flex items-center justify-center shrink-0 mt-1">
                        <FiPhone size={15} className="text-[#a078ff]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <FieldLabel>Alternative Mobile</FieldLabel>
                        <TextInput
                          type="tel"
                          value={user.altMobile}
                          onChange={(e) => {
                            setUser((p) => ({ ...p, altMobile: e.target.value }));
                            setAltErr(false);
                          }}
                          placeholder="Enter 10-digit alternative number"
                          hasError={altErr}
                        />
                        {altErr && (
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-400">
                            <FiX size={12} className="shrink-0" />
                            <span>Please enter a valid 10-digit alternative number.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-xl bg-[rgba(160,120,255,0.1)] flex items-center justify-center shrink-0">
                        <MdEmail size={16} className="text-[#a078ff]" />
                      </div>
                      <div>
                        <FieldLabel>Email</FieldLabel>
                        <div className="text-[#e8e0ff] font-medium">{user.email}</div>
                      </div>
                    </div>

                    <Divider />

                    {/* ── Address row ── */}
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-8 h-8 rounded-xl bg-[rgba(160,120,255,0.1)] flex items-center justify-center shrink-0 mt-0.5">
                        <RiMapPin2Fill size={16} className="text-[#a078ff]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <FieldLabel>Address</FieldLabel>
                            <span className="text-[9px] font-bold text-[#a078ff] bg-[rgba(160,120,255,0.12)] px-1.5 py-0.5 rounded-full border border-[rgba(160,120,255,0.25)] -mt-2.5">
                              {user.address.tag}
                            </span>
                          </div>
                          <button
                            onClick={openEdit}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#a078ff] border border-[rgba(160,120,255,0.3)] px-2.5 py-1 rounded-lg hover:bg-[rgba(160,120,255,0.1)] hover:border-[#a078ff] transition-all -mt-2.5"
                          >
                            <FiEdit2 size={12} /> Change
                          </button>
                        </div>
                        <div className="text-[#e8e0ff] font-medium leading-snug">{user.address.line1}</div>
                        <div className="text-[#e8e0ff] font-medium leading-snug">{user.address.line2}</div>
                      </div>
                    </div>

                  </div>
                )}

                {/* ── EDIT mode ── */}
                {editMode && (
                  <div className="flex flex-col gap-3.5">

                    {/* Cancel link at top-right */}
                    <div className="flex justify-end -mt-2 mb-1">
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex items-center gap-1 text-xs text-[#8880aa] hover:text-[#e8e0ff] transition-colors"
                      >
                        <FiX size={13} /> Cancel
                      </button>
                    </div>

                    {/* Read-only: name */}
                    <div className="flex items-center gap-3 text-sm opacity-40 select-none pointer-events-none">
                      <div className="w-8 h-8 rounded-xl bg-[rgba(160,120,255,0.1)] flex items-center justify-center shrink-0">
                        <FiUser size={15} className="text-[#a078ff]" />
                      </div>
                      <div>
                        <FieldLabel>Name</FieldLabel>
                        <div className="text-[#e8e0ff] font-medium">{user.name}</div>
                      </div>
                    </div>

                    {/* Read-only: primary mobile */}
                    <div className="flex items-center gap-3 text-sm opacity-40 select-none pointer-events-none">
                      <div className="w-8 h-8 rounded-xl bg-[rgba(160,120,255,0.1)] flex items-center justify-center shrink-0">
                        <FiPhone size={15} className="text-[#a078ff]" />
                      </div>
                      <div>
                        <FieldLabel>Mobile</FieldLabel>
                        <div className="text-[#e8e0ff] font-medium">{user.mobile}</div>
                      </div>
                    </div>

                    {/* Alternative mobile — editable */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <FiPhone size={12} className="text-[#a078ff]" />
                        <span className="text-[10px] text-[#8880aa] uppercase tracking-widest">
                          Alternative Mobile
                        </span>
                      </div>
                      <TextInput
                        type="tel"
                        value={draft.altMobile}
                        onChange={(e) => setField("altMobile", e.target.value)}
                        placeholder="Enter 10-digit alternative number"
                      />
                    </div>

                    {/* Read-only: email */}
                    <div className="flex items-center gap-3 text-sm opacity-40 select-none pointer-events-none">
                      <div className="w-8 h-8 rounded-xl bg-[rgba(160,120,255,0.1)] flex items-center justify-center shrink-0">
                        <MdEmail size={16} className="text-[#a078ff]" />
                      </div>
                      <div>
                        <FieldLabel>Email</FieldLabel>
                        <div className="text-[#e8e0ff] font-medium">{user.email}</div>
                      </div>
                    </div>

                    <Divider />

                    {/* Address tag selector */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <FiMapPin size={12} className="text-[#a078ff]" />
                        <FieldLabel>Address Tag</FieldLabel>
                      </div>
                      <div className="flex gap-2 mb-3">
                        {["HOME", "WORK", "OTHER"].map((t) => (
                          <button
                            key={t}
                            onClick={() => setAddr("tag", t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                              ${draft.address.tag === t
                                ? "border-[#a078ff] bg-[rgba(160,120,255,0.13)] text-[#a078ff] shadow-[0_0_8px_rgba(160,120,255,0.2)]"
                                : "border-[rgba(160,120,255,0.2)] text-[#8880aa] hover:border-[#a078ff] hover:text-[#a078ff]"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <div className="mb-3">
                        <FieldLabel>Address Line 1</FieldLabel>
                        <TextInput
                          value={draft.address.line1}
                          onChange={(e) => setAddr("line1", e.target.value)}
                          placeholder="House / Flat / Block No., Street"
                        />
                      </div>
                      <div>
                        <FieldLabel>Address Line 2 / City / PIN</FieldLabel>
                        <TextInput
                          value={draft.address.line2}
                          onChange={(e) => setAddr("line2", e.target.value)}
                          placeholder="Area, City, State, Pincode"
                        />
                      </div>
                    </div>

                    {/* Save button */}
                    <button
                      onClick={handleSave}
                      className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-br from-[#a078ff] to-[#7c3aed]
                        text-white text-sm font-bold flex items-center justify-center gap-2
                        hover:shadow-[0_0_20px_rgba(160,120,255,0.4)] transition-all"
                    >
                      <FiCheck size={15} /> Save Address
                    </button>
                  </div>
                )}
              </Card>

              {/* ── Order Items ── */}
              <Card>
                <SecLabel>Order Items</SecLabel>

                <div className="flex gap-4 items-start">

                  {/* Product image — click to zoom */}
                  <button
                    onClick={() => setImgPopup(true)}
                    title="Click to zoom"
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#0E1320]
                      border border-[rgba(160,120,255,0.18)] flex items-center justify-center
                      shrink-0 overflow-hidden group
                      hover:border-[#a078ff] hover:shadow-[0_0_14px_rgba(160,120,255,0.3)]
                      transition-all duration-300"
                  >
                    <img
                      src={PRODUCT.image}
                      alt={PRODUCT.name}
                      className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-[rgba(14,19,32,0.6)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                      <FiZoomIn size={22} className="text-[#a078ff]" />
                    </div>
                  </button>

                  {/* Product info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="text-sm font-semibold text-[#e8e0ff] leading-snug line-clamp-2"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {PRODUCT.name}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-yellow-400 text-xs">{"★".repeat(Math.round(PRODUCT.rating))}</span>
                      <span className="text-xs text-[#8880aa]">{PRODUCT.rating} · ({PRODUCT.ratingCount})</span>
                      <span className="text-[9px] font-bold text-[#a078ff] bg-[rgba(160,120,255,0.12)] px-1.5 py-0.5 rounded-full border border-[rgba(160,120,255,0.22)] flex items-center gap-0.5">
                        <BsTagFill size={8} /> {PRODUCT.badge}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
                      <span className="text-lg font-bold text-[#17ec03]"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {fmt(PRODUCT.price)}
                      </span>
                      <span className="text-xs text-[#8880aa] line-through">{fmt(PRODUCT.oldPrice)}</span>
                      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <MdDiscount size={11} /> ({PRODUCT.discountPct}% OFF)
                      </span>
                    </div>

                    <span className="text-[10px] text-[#8880aa] uppercase tracking-widest">Size - XL</span>

                    {/* Qty stepper */}
                    <div className="flex items-center gap-2.5 mt-1">
                      <span className="text-[10px] text-[#8880aa] uppercase tracking-widest">Qty</span>
                      <div className="flex items-center border border-[rgba(160,120,255,0.25)] rounded-xl overflow-hidden">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="w-8 h-8 flex items-center justify-center text-[#a078ff] hover:bg-[rgba(160,120,255,0.12)] transition-all text-lg font-bold"
                        >−</button>
                        <span className="px-3 text-sm font-semibold text-[#e8e0ff] min-w-[28px] text-center">{qty}</span>
                        <button
                          onClick={() => setQty((q) => q + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#a078ff] hover:bg-[rgba(160,120,255,0.12)] transition-all text-lg font-bold"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Delivery row */}
                <div className="flex items-center gap-2.5 text-sm">
                  <MdDeliveryDining size={22} className="text-[#a078ff] shrink-0" />
                  <div>
                    <FieldLabel>Estimated Delivery</FieldLabel>
                    <div className="text-[#e8e0ff] font-medium">
                      <span className="text-green-400 font-semibold">{PRODUCT.deliveryDate}</span>
                      {" — "}
                      <span className="text-green-400 text-xs font-bold">FREE Delivery</span>
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
                    <span className="text-[#8880aa]">MRP{qty > 1 ? ` (×${qty})` : ""}</span>
                    <span className="text-[#e8e0ff] font-medium">{fmt(PRODUCT.oldPrice * qty)}</span>
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
                        {feesOpen
                          ? <FiChevronUp size={13} />
                          : <FiChevronDown size={13} />}
                      </span>
                      <span className="text-green-400 font-semibold">
                        {delivery === 0 ? "FREE" : fmt(delivery)}
                      </span>
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

              {/* Continue button — validates alt mobile */}
              <button
                onClick={handleContinue}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl
                  bg-gradient-to-br from-[#FFE51F] to-[#FFD600]
                  text-[#111827] text-base font-bold tracking-wide
                  shadow-[0_0_24px_rgba(255,229,31,0.35)]
                  hover:shadow-[0_0_36px_rgba(255,229,31,0.55)]
                  hover:-translate-y-[1px] transition-all duration-300"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <IoIosFlash size={22} /> Continue to Payment
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
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
              bg-gradient-to-br from-[#FFE51F] to-[#FFD600]
              text-[#111827] text-sm font-bold tracking-wide
              shadow-[0_0_20px_rgba(255,229,31,0.35)]
              hover:shadow-[0_0_30px_rgba(255,229,31,0.55)]
              transition-all duration-300"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <IoIosFlash size={20} /> Continue to Payment
          </button>
        </div>

      </div>
    </>
  );
}