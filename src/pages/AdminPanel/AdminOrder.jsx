// Order.jsx
import { useState } from "react";

const ORDERS = [
  { id: "#MA1256", customer: "Rahul Verma",   product: "Uchiha Itachi Tee",  amount: "₹799",  date: "03 May 2026", status: "Processing" },
  { id: "#MA1255", customer: "Sneha Kapoor",  product: "Moon Aura Tee",       amount: "₹749",  date: "03 May 2026", status: "Shipped"    },
  { id: "#MA1254", customer: "Arjun Das",     product: "Tokyo Drift Tee",     amount: "₹799",  date: "02 May 2026", status: "Delivered"  },
  { id: "#MA1253", customer: "Priya Singh",   product: "Shadow Hunter Tee",   amount: "₹849",  date: "02 May 2026", status: "Processing" },
  { id: "#MA1252", customer: "Vikram Nair",   product: "Neon Ghost Hoodie",   amount: "₹1299", date: "01 May 2026", status: "Shipped"    },
  { id: "#MA1251", customer: "Ananya Bose",   product: "Astral Wave Hoodie",  amount: "₹1399", date: "30 Apr 2026", status: "Delivered"  },
  { id: "#MA1250", customer: "Rohit Mehta",   product: "Oversized Kanji Tee", amount: "₹899",  date: "29 Apr 2026", status: "Cancelled"  },
  { id: "#MA1249", customer: "Kavya Pillai",  product: "Aurora Crop Tee",     amount: "₹749",  date: "28 Apr 2026", status: "Delivered"  },
];

const STATUS_STYLES = {
  Processing: { bg: "rgba(234,179,8,0.12)",  color: "#fbbf24", border: "rgba(234,179,8,0.3)"  },
  Shipped:    { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  Delivered:  { bg: "rgba(34,197,94,0.12)",  color: "#4ade80", border: "rgba(34,197,94,0.3)"  },
  Cancelled:  { bg: "rgba(239,68,68,0.12)",  color: "#f87171", border: "rgba(239,68,68,0.3)"  },
};

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Processing;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

const FILTERS = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrder() {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ORDERS.filter((o) =>
    (active === "All" || o.status === active) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) ||
     o.customer.toLowerCase().includes(search.toLowerCase()) ||
     o.product.toLowerCase().includes(search.toLowerCase()))
  );

  // Counts
  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All" ? ORDERS.length : ORDERS.filter((o) => o.status === f).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>Orders</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
          Manage and track all customer orders
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {["Processing","Shipped","Delivered","Cancelled"].map((s) => {
          const st = STATUS_STYLES[s];
          return (
            <div key={s} className="rounded-xl p-4 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: st.bg, border: `1px solid ${st.border}` }}>
                <span className="text-lg font-bold" style={{ color: st.color }}>{counts[s]}</span>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: st.color }}>{s}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>orders</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters + search */}
      <div className="rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setActive(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={active === f
                ? { background: "linear-gradient(135deg,rgba(139,92,246,0.28),rgba(124,58,237,0.18))", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.4)" }
                : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }
              }>
              {f} {f !== "All" && <span style={{ opacity: 0.6 }}>({counts[f]})</span>}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs ml-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders…"
            className="w-full pl-8 pr-4 py-2 text-sm rounded-xl outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", caretColor: "#a78bfa" }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

        <div className="hidden md:grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.28)", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          <span className="col-span-2">Order ID</span>
          <span className="col-span-3">Customer</span>
          <span className="col-span-3">Product</span>
          <span className="col-span-1 text-right">Amount</span>
          <span className="col-span-1 text-center">Date</span>
          <span className="col-span-2 text-right">Status</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>No orders found.</div>
        ) : (
          filtered.map((o, i) => (
            <div key={o.id}
              className="grid grid-cols-2 md:grid-cols-12 px-5 py-4 items-center gap-y-1 transition-colors duration-150"
              style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(139,92,246,0.05)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <span className="col-span-2 text-xs font-mono font-semibold" style={{ color: "#a78bfa" }}>{o.id}</span>
              <span className="col-span-3 text-sm" style={{ color: "#fff" }}>{o.customer}</span>
              <span className="col-span-3 text-sm truncate" style={{ color: "rgba(255,255,255,0.55)" }}>{o.product}</span>
              <span className="col-span-1 text-sm font-semibold text-right" style={{ color: "#f5c542" }}>{o.amount}</span>
              <span className="col-span-1 text-xs text-center" style={{ color: "rgba(255,255,255,0.38)" }}>{o.date}</span>
              <div className="col-span-2 flex justify-end"><Badge status={o.status} /></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}