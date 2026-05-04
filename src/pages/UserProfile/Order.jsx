// Order.jsx
export default function Order() {
  return (
    <div>
      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#fff" }}>
          My Orders
        </h2>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
          Track and manage your purchases
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
          style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <p className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
          No orders yet
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          Your past purchases will appear here
        </p>
        <a
          href="/"
          className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "#fff",
            textDecoration: "none",
            boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
          }}
        >
          Start Shopping
        </a>
      </div>
    </div>
  );
}