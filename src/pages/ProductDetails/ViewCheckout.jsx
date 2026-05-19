import { useState } from "react";
import { IoIosFlash } from "react-icons/io";
import { HiHomeModern } from "react-icons/hi2";
import { MdDeliveryDining } from "react-icons/md";
import { FiEdit2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import tshirt9 from "../../assets/images/products/tshirt9.png"; // replace with your product image

// ── Mock user data (replace with real auth/context) ──────────────────────────
const USER = {
  name: "Tushar Mal",
  mobile: "9641539527",
  email: "tushar.mal@example.com",
  address: {
    tag: "HOME",
    line1: "Udaynarayan pur, Udaynarayanpur, Pearapur,",
    line2: "Pearapur, South Mal Para, Haora District 711226",
  },
};

const PRODUCT = {
  name: "Canon PIXMA G3470 All-in-One Wi-Fi Ink Tank Colour Printer",
  image: tshirt9,
  price: 8299,
  oldPrice: 12495,
  discount: "33% OFF",
  deliveryCharge: 0,
  deliveryDate: "Tomorrow by 11 PM",
  badge: "Best Seller",
  rating: 4.3,
  ratingCount: "2,841",
};

const STEPS = ["Address", "Order Summary", "Payment"];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  "₹" + Number(n).toLocaleString("en-IN");

// ── Step indicator ────────────────────────────────────────────────────────────
const Stepper = ({ current }) => (
  <div className="flex items-center justify-center gap-0 mb-8 select-none">
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${done ? "bg-[#a078ff] border-[#a078ff] text-white shadow-[0_0_14px_rgba(160,120,255,0.55)]"
                  : active ? "bg-transparent border-[#a078ff] text-[#a078ff] shadow-[0_0_10px_rgba(160,120,255,0.3)]"
                  : "bg-transparent border-[rgba(160,120,255,0.22)] text-[#8880aa]"}`}
            >
              {done ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] tracking-widest uppercase ${active ? "text-[#a078ff]" : done ? "text-[#a078ff]/70" : "text-[#8880aa]"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-16 sm:w-24 h-px mx-1 mb-4 ${done ? "bg-[#a078ff]" : "bg-[rgba(160,120,255,0.18)]"}`} />
          )}
        </div>
      );
    })}
  </div>
);

// ── Section card wrapper ───────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-[#12121a] border border-[rgba(160,120,255,0.13)] rounded-2xl px-5 py-4 ${className}`}>
    {children}
  </div>
);

// ── Divider ───────────────────────────────────────────────────────────────────
const Divider = () => <div className="h-px bg-[rgba(160,120,255,0.10)] my-3" />;

// ── Section label ─────────────────────────────────────────────────────────────
const Label = ({ children }) => (
  <div className="text-[10px] tracking-[0.15em] uppercase text-[#8880aa] mb-2.5">{children}</div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ViewCheckout() {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [feesOpen, setFeesOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [user, setUser] = useState(USER);
  const [draft, setDraft] = useState(USER);

  const subtotal = PRODUCT.price * qty;
  const delivery = PRODUCT.deliveryCharge;
  const total = subtotal + delivery;
  const saved = (PRODUCT.oldPrice - PRODUCT.price) * qty;

  const handleSaveAddress = () => {
    setUser(draft);
    setEditMode(false);
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
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#0E1320}
        ::-webkit-scrollbar-thumb{background:rgba(160,120,255,0.28);border-radius:4px}
        .cinzel{font-family:'Cinzel',serif}
        body{margin:0}
        input,select{outline:none}
      `}</style>

      <div
        className="min-h-screen bg-[#0E1320] text-[#e8e0ff] pb-24"
        style={{ fontFamily: "'Raleway', sans-serif" }}
      >
        {/* ── Top bar ── */}
        <div className="sticky top-0 z-40 bg-[#0E1320]/90 backdrop-blur border-b border-[rgba(160,120,255,0.10)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-xl border border-[rgba(160,120,255,0.22)] flex items-center justify-center text-[#a078ff] text-lg hover:bg-[rgba(160,120,255,0.1)] transition-all"
            >‹</button>
            <span className="cinzel text-base font-bold text-[#e8e0ff] tracking-wide">Checkout</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8">
          {/* Stepper */}
          <Stepper current={1} />

          {/* ── Grid layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

            {/* ══ LEFT COLUMN ══ */}
            <div className="flex flex-col gap-5">

              {/* ── User info ── */}
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <Label>Delivery Details</Label>
                  <button
                    onClick={() => { setEditMode((p) => !p); setDraft(user); }}
                    className="flex items-center gap-1 text-xs text-[#a078ff] hover:text-[#c4aeff] transition-colors"
                  >
                    <FiEdit2 size={12} /> {editMode ? "Cancel" : "Change"}
                  </button>
                </div>

                {!editMode ? (
                  /* ── View mode ── */
                  <div className="flex flex-col gap-3">
                    {[
                      { icon: "👤", label: "Name", val: user.name },
                      { icon: "📱", label: "Mobile", val: user.mobile },
                      { icon: "✉️", label: "Email", val: user.email },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="text-base">{row.icon}</span>
                        <div>
                          <div className="text-[10px] text-[#8880aa] uppercase tracking-widest">{row.label}</div>
                          <div className="text-[#e8e0ff] font-medium">{row.val}</div>
                        </div>
                      </div>
                    ))}
                    <Divider />
                    <div className="flex items-start gap-3 text-sm">
                      <HiHomeModern size={20} className="text-[#a078ff] mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] text-[#8880aa] uppercase tracking-widest">Address</span>
                          <span className="text-[9px] font-bold text-[#a078ff] bg-[rgba(160,120,255,0.12)] px-1.5 py-0.5 rounded-full border border-[rgba(160,120,255,0.25)]">
                            {user.address.tag}
                          </span>
                        </div>
                        <div className="text-[#e8e0ff] font-medium leading-snug">{user.address.line1}</div>
                        <div className="text-[#e8e0ff] font-medium leading-snug">{user.address.line2}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── Edit mode ── */
                  <div className="flex flex-col gap-3">
                    {[
                      { key: "name", label: "Full Name", icon: "👤" },
                      { key: "mobile", label: "Mobile Number", icon: "📱" },
                      { key: "email", label: "Email Address", icon: "✉️" },
                    ].map((f) => (
                      <div key={f.key}>
                        <div className="text-[10px] text-[#8880aa] uppercase tracking-widest mb-1">{f.label}</div>
                        <input
                          value={draft[f.key]}
                          onChange={(e) => setDraft((p) => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full bg-[#0E1320] border border-[rgba(160,120,255,0.25)] rounded-xl px-3 py-2.5 text-sm text-[#e8e0ff] focus:border-[#a078ff] focus:shadow-[0_0_10px_rgba(160,120,255,0.2)] transition-all"
                        />
                      </div>
                    ))}
                    <Divider />
                    {[
                      { key: "line1", label: "Address Line 1" },
                      { key: "line2", label: "Address Line 2 / City / PIN" },
                    ].map((f) => (
                      <div key={f.key}>
                        <div className="text-[10px] text-[#8880aa] uppercase tracking-widest mb-1">{f.label}</div>
                        <input
                          value={draft.address[f.key]}
                          onChange={(e) =>
                            setDraft((p) => ({ ...p, address: { ...p.address, [f.key]: e.target.value } }))
                          }
                          className="w-full bg-[#0E1320] border border-[rgba(160,120,255,0.25)] rounded-xl px-3 py-2.5 text-sm text-[#e8e0ff] focus:border-[#a078ff] focus:shadow-[0_0_10px_rgba(160,120,255,0.2)] transition-all"
                        />
                      </div>
                    ))}
                    <button
                      onClick={handleSaveAddress}
                      className="mt-1 w-full py-2.5 rounded-xl bg-gradient-to-br from-[#a078ff] to-[#7c3aed] text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(160,120,255,0.35)] transition-all"
                    >
                      Save Address
                    </button>
                  </div>
                )}
              </Card>

              {/* ── Product row ── */}
              <Card>
                <Label>Order Items</Label>
                <div className="flex gap-4 items-start">
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#0E1320] border border-[rgba(160,120,255,0.13)] flex items-center justify-center shrink-0 overflow-hidden">
                    <img src={PRODUCT.image} alt={PRODUCT.name} className="w-full h-full object-contain p-1" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="text-sm font-semibold text-[#e8e0ff] leading-snug line-clamp-2"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {PRODUCT.name}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-yellow-400 text-xs">{'★'.repeat(Math.round(PRODUCT.rating))}</span>
                      <span className="text-xs text-[#8880aa]">{PRODUCT.rating} · ({PRODUCT.ratingCount})</span>
                      <span className="text-[9px] font-bold text-[#a078ff] bg-[rgba(160,120,255,0.12)] px-1.5 py-0.5 rounded-full border border-[rgba(160,120,255,0.22)]">
                        {PRODUCT.badge}
                      </span>
                    </div>

                    {/* Price row */}
                    <div className="flex items-baseline gap-2 flex-wrap mt-0.5">
                      <span className="text-lg font-bold text-[#17ec03]" style={{ fontFamily: "'Poppins',sans-serif" }}>
                        {fmt(PRODUCT.price)}
                      </span>
                      <span className="text-xs text-[#8880aa] line-through">{fmt(PRODUCT.oldPrice)}</span>
                      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        {PRODUCT.discount}
                      </span>
                    </div>

                    {/* Qty selector */}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-[#8880aa] uppercase tracking-widest">Qty</span>
                      <div className="flex items-center border border-[rgba(160,120,255,0.25)] rounded-xl overflow-hidden">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="w-8 h-8 flex items-center justify-center text-[#a078ff] hover:bg-[rgba(160,120,255,0.12)] transition-all text-lg font-bold"
                        >−</button>
                        <span className="px-3 text-sm font-semibold text-[#e8e0ff] min-w-[28px] text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => setQty((q) => q + 1)}
                          className="w-8 h-8 flex items-center justify-center text-[#a078ff] hover:bg-[rgba(160,120,255,0.12)] transition-all text-lg font-bold"
                        >+</button>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Delivery info */}
                <div className="flex items-center gap-2.5 text-sm">
                  <MdDeliveryDining size={22} className="text-[#a078ff] shrink-0" />
                  <div>
                    <div className="text-[10px] text-[#8880aa] uppercase tracking-widest">Estimated Delivery</div>
                    <div className="text-[#e8e0ff] font-medium">
                      <span className="text-green-400 font-semibold">{PRODUCT.deliveryDate}</span>
                      {" — "}
                      <span className="text-green-400 text-xs font-bold">FREE Delivery</span>
                    </div>
                  </div>
                </div>
              </Card>

            </div>

            {/* ══ RIGHT COLUMN — Price summary ══ */}
            <div className="lg:sticky lg:top-20 flex flex-col gap-4">
              <Card>
                <Label>Price Summary</Label>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8880aa]">MRP{qty > 1 ? ` (×${qty})` : ""}</span>
                    <span className="text-[#e8e0ff] font-medium">{fmt(PRODUCT.oldPrice * qty)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#8880aa]">Discount</span>
                    <span className="text-green-400 font-semibold">− {fmt(saved)}</span>
                  </div>

                  {/* Delivery / Fees expandable */}
                  <div>
                    <button
                      onClick={() => setFeesOpen((p) => !p)}
                      className="flex justify-between items-center w-full text-[#8880aa] hover:text-[#e8e0ff] transition-colors"
                    >
                      <span className="flex items-center gap-1">
                        Delivery & Fees
                        {feesOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                      </span>
                      <span className="text-green-400 font-semibold">
                        {delivery === 0 ? "FREE" : fmt(delivery)}
                      </span>
                    </button>
                    {feesOpen && (
                      <div className="mt-2 bg-[#0E1320] border border-[rgba(160,120,255,0.13)] rounded-xl px-3 py-2.5 text-xs text-[#8880aa] leading-relaxed">
                        <div className="flex justify-between mb-1">
                          <span>Shipping</span><span className="text-green-400">FREE</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform fee</span><span>₹0</span>
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
                    <div className="text-center text-xs text-green-400 bg-green-400/10 rounded-lg py-2">
                      🎉 You save {fmt(saved)} on this order!
                    </div>
                  )}
                </div>
              </Card>

              {/* Continue button */}
              <button
                onClick={() => navigate("/payment")}
                className="
                  w-full flex items-center justify-center gap-2
                  py-4 rounded-2xl
                  bg-gradient-to-br from-[#FFE51F] to-[#FFD600]
                  text-[#111827] text-base font-bold tracking-wide
                  shadow-[0_0_24px_rgba(255,229,31,0.35)]
                  hover:shadow-[0_0_36px_rgba(255,229,31,0.55)]
                  hover:-translate-y-[1px]
                  transition-all duration-300
                "
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <IoIosFlash size={22} />
                Continue to Payment
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: "🔒", label: "Secure Payment" },
                  { icon: "↩️", label: "Easy Returns" },
                  { icon: "✅", label: "Verified Seller" },
                ].map((b, i) => (
                  <div key={i} className="bg-[#12121a] border border-[rgba(160,120,255,0.10)] rounded-xl py-2.5 flex flex-col items-center gap-1">
                    <span className="text-lg">{b.icon}</span>
                    <span className="text-[9px] text-[#8880aa] leading-tight text-center">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Mobile sticky bottom ── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 py-3 bg-[#0E1320]/95 backdrop-blur border-t border-[rgba(160,120,255,0.12)]">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-[10px] text-[#8880aa] uppercase tracking-widest">Total</div>
              <div className="cinzel text-lg font-bold text-[#17ec03]">{fmt(total)}</div>
            </div>
            {saved > 0 && (
              <div className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                Save {fmt(saved)}
              </div>
            )}
          </div>
          <button
            onClick={() => navigate("/payment")}
            className="
              w-full flex items-center justify-center gap-2
              py-3.5 rounded-xl
              bg-gradient-to-br from-[#FFE51F] to-[#FFD600]
              text-[#111827] text-sm font-bold tracking-wide
              shadow-[0_0_20px_rgba(255,229,31,0.35)]
              hover:shadow-[0_0_30px_rgba(255,229,31,0.55)]
              transition-all duration-300
            "
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <IoIosFlash size={20} />
            Continue to Payment
          </button>
        </div>

      </div>
    </>
  );
}