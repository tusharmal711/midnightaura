// AdminDashboard.jsx
import { useState } from "react";

// ── Tiny sparkline SVG ─────────────────────────────────────────────
function Sparkline({ color = "#a78bfa", data = [] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ── Stat card ─────────────────────────────────────────────────────
function StatCard({ label, value, change, positive, icon, accent, spark }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
      {/* Glow blob */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: accent, filter: "blur(28px)", opacity: 0.35 }}/>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
          <p className="text-2xl font-bold" style={{ color: "#fff" }}>{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent + "22", border: `1px solid ${accent}40`, color: accent }}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full`}
          style={{ background: positive ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: positive ? "#4ade80" : "#f87171" }}>
          {positive ? "▲" : "▼"} {change}
        </span>
        <Sparkline color={accent} data={spark} />
      </div>
    </div>
  );
}

// ── Order status badge ─────────────────────────────────────────────
const STATUS = {
  Processing: { bg: "rgba(234,179,8,0.12)", color: "#fbbf24", border: "rgba(234,179,8,0.3)" },
  Shipped:    { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  Delivered:  { bg: "rgba(34,197,94,0.12)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  Cancelled:  { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
};

function Badge({ status }) {
  const s = STATUS[status] || STATUS.Processing;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

// ── Star rating ───────────────────────────────────────────────────
function Stars({ n }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= n ? "#f5c542" : "none"} stroke="#f5c542" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// ── Simple bar chart ──────────────────────────────────────────────
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SALES = [12000, 18500, 15000, 22000, 19000, 24500, 24500];
const MAX_S = Math.max(...SALES);

function SalesChart() {
  const [hovered, setHovered] = useState(null);
  return (
    <div className="flex items-end gap-2 h-36 w-full">
      {SALES.map((v, i) => {
        const pct = (v / MAX_S) * 100;
        const isHov = hovered === i;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            {isHov && (
              <span className="text-xs font-bold" style={{ color: "#c4b5fd" }}>
                ₹{(v/1000).toFixed(1)}K
              </span>
            )}
            <div className="w-full rounded-t-lg transition-all duration-300 relative overflow-hidden"
              style={{
                height: `${pct}%`,
                background: isHov
                  ? "linear-gradient(180deg,#a78bfa,#7c3aed)"
                  : "linear-gradient(180deg,rgba(139,92,246,0.55),rgba(124,58,237,0.25))",
                boxShadow: isHov ? "0 0 16px rgba(167,139,250,0.5)" : "none",
                transition: "all 0.2s",
              }}/>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>{DAYS[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────
function Section({ title, action, children }) {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold tracking-wide" style={{ color: "#fff" }}>{title}</h3>
        {action && (
          <button className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
            style={{ color: "#a78bfa", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)" }}>
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Mock data ─────────────────────────────────────────────────────
const ORDERS = [
  { id: "#MA1256", product: "Uchiha Itachi Tee", price: "₹799", status: "Processing" },
  { id: "#MA1255", product: "Moon Aura Tee",     price: "₹749", status: "Shipped"    },
  { id: "#MA1254", product: "Tokyo Drift Tee",   price: "₹799", status: "Delivered"  },
  { id: "#MA1253", product: "Shadow Hunter Tee", price: "₹849", status: "Processing" },
  { id: "#MA1252", product: "Neon Ghost Hoodie", price: "₹1299",status: "Shipped"    },
];

const TOP_PRODUCTS = [
  { name: "Uchiha Itachi Tee", sold: 1245, pct: 88, color: "#a78bfa" },
  { name: "Moon Aura Tee",     sold: 987,  pct: 70, color: "#f5c542" },
  { name: "Tokyo Drift Tee",   sold: 764,  pct: 54, color: "#60a5fa" },
];

const REVIEWS = [
  { name: "Rahul Verma",  stars: 5, text: "Amazing quality and design! Totally worth it.", avatar: "RV" },
  { name: "Sneha Kapoor", stars: 4, text: "Love the fabric. Fast delivery too!",           avatar: "SK" },
  { name: "Arjun Das",    stars: 5, text: "Best streetwear brand in India hands down.",    avatar: "AD" },
];

// ── Main ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
          Welcome back, Admin — here's what's happening today.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Orders"    value="1,245"    change="12.5%"  positive accent="#a78bfa"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
          spark={[5,8,6,10,12,9,11,14,13,15]} />
        <StatCard label="Total Sales"     value="₹2,45,000" change="18.3%"  positive accent="#f5c542"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          spark={[8,12,10,15,13,18,16,20,19,22]} />
        <StatCard label="Total Customers" value="3,456"    change="14.2%"  positive accent="#60a5fa"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          spark={[3,5,4,7,6,9,8,11,10,12]} />
        <StatCard label="Total Products"  value="128"      change="6.7%"   positive accent="#4ade80"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
          spark={[2,3,4,3,5,4,6,5,7,8]} />
      </div>

      {/* ── Sales + Recent Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

        {/* Sales chart */}
        <div className="lg:col-span-3">
          <Section title="Sales Overview" action="This Week ▾">
            <div className="mb-4">
              <p className="text-2xl font-bold" style={{ color: "#fff" }}>₹2,45,000</p>
              <p className="text-xs mt-0.5" style={{ color: "#4ade80" }}>▲ 18.3% vs last month</p>
            </div>
            <SalesChart />
          </Section>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2">
          <Section title="Recent Orders" action="View All">
            <div className="flex flex-col gap-3">
              {ORDERS.map((o) => (
                <div key={o.id} className="flex items-center gap-3 py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                    {o.id.slice(-2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "#fff" }}>{o.id}</p>
                    <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{o.product}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold mb-1" style={{ color: "#fff" }}>{o.price}</p>
                    <Badge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* ── Top Products + Reviews ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top products */}
        <Section title="Top Selling Products" action="View All">
          <div className="flex flex-col gap-4">
            {TOP_PRODUCTS.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4">
                <span className="text-sm font-bold w-5 shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>{i + 1}</span>
                <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1.5">
                    <p className="text-sm font-medium truncate" style={{ color: "#fff" }}>{p.name}</p>
                    <p className="text-xs font-semibold shrink-0 ml-2" style={{ color: p.color }}>{p.sold.toLocaleString()} Sold</p>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: `linear-gradient(90deg,${p.color},${p.color}88)` }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Customer reviews */}
        <Section title="Customer Reviews" action="View All">
          <div className="flex flex-col gap-4">
            {REVIEWS.map((r) => (
              <div key={r.name} className="flex gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#d97706)", color: "#fff" }}>
                  {r.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#fff" }}>{r.name}</p>
                  <Stars n={r.stars} />
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}