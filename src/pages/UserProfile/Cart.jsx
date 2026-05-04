// Cart.jsx
export default function Cart() {
  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#fff" }}>
          My Cart
        </h2>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Items saved in your cart
        </p>
      </div>

      {/* Empty state */}
      <div
        className="rounded-2xl flex flex-col items-center justify-center py-20 gap-4"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.1)",
        }}
      >
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(234,179,8,0.10)", border: "1px solid rgba(234,179,8,0.2)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <p className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
          Your cart is empty
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          Add items to your cart to see them here
        </p>
        <a
          href="/"
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #d97706, #b45309)",
            color: "#fff",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(217,119,6,0.35)",
          }}
        >
          Browse Collection
        </a>
      </div>
    </div>
  );
}