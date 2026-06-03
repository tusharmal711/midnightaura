// DeliveryDashboard.jsx
import { useState } from "react";

// ── Sparkline ─────────────────────────────────────────────────────
function Sparkline({ color = "#38bdf8", data = [] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline
        points={pts}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────
function StatCard({ label, value, change, positive, icon, accent, spark }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: accent, filter: "blur(28px)", opacity: 0.35 }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-xs font-medium uppercase tracking-widest mb-1"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {label}
          </p>
          <p className="text-2xl font-bold" style={{ color: "#fff" }}>
            {value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: accent + "22",
            border: `1px solid ${accent}40`,
            color: accent,
          }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: positive
              ? "rgba(34,197,94,0.12)"
              : "rgba(239,68,68,0.12)",
            color: positive ? "#4ade80" : "#f87171",
          }}
        >
          {positive ? "▲" : "▼"} {change}
        </span>
        <Sparkline color={accent} data={spark} />
      </div>
    </div>
  );
}

// ── Earnings Data by Period ───────────────────────────────────────
const EARNINGS_DATA = {
  day: {
    labels: ["9am","10am","11am","12pm","1pm","2pm","3pm","4pm","5pm","6pm","7pm","8pm"],
    values: [0, 120, 240, 180, 300, 150, 420, 360, 510, 480, 390, 270],
    total: "₹3,420",
    deliveries: 6,
    change: "12.5%",
    positive: true,
  },
  month: {
    labels: ["1","4","7","10","13","16","19","22","25","28","31"],
    values: [1200,2800,1900,3400,2600,4200,3800,5100,4400,6200,5800],
    total: "₹41,400",
    deliveries: 74,
    change: "8.3%",
    positive: true,
  },
  year: {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    values: [18000,22000,19000,25000,21000,28000,31000,27000,33000,29000,36000,41000],
    total: "₹3,30,000",
    deliveries: 612,
    change: "22.1%",
    positive: true,
  },
  alltime: {
    labels: ["2021","2022","2023","2024","2025","2026"],
    values: [45000,112000,198000,285000,412000,330000],
    total: "₹13,82,000",
    deliveries: 2481,
    change: "All Time",
    positive: true,
  },
};

// ── Earnings Chart ────────────────────────────────────────────────
function EarningsChart({ period }) {
  const [hovered, setHovered] = useState(null);
  const data = EARNINGS_DATA[period];
  const max = Math.max(...data.values);

  return (
    <div className="flex items-end gap-1.5 h-40 w-full">
      {data.values.map((v, i) => {
        const pct = (v / max) * 100;
        const isHov = hovered === i;
        return (
          <div
            key={i}
            className="flex flex-col items-center gap-1 flex-1"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {isHov && (
              <span
                className="text-xs font-bold whitespace-nowrap"
                style={{ color: "#38bdf8", fontSize: "10px" }}
              >
                ₹{v >= 1000 ? (v / 1000).toFixed(1) + "K" : v}
              </span>
            )}
            <div
              className="w-full rounded-t-lg relative overflow-hidden"
              style={{
                height: `${pct}%`,
                minHeight: 4,
                background: isHov
                  ? "linear-gradient(180deg,#38bdf8,#0284c7)"
                  : "linear-gradient(180deg,rgba(56,189,248,0.55),rgba(2,132,199,0.2))",
                boxShadow: isHov ? "0 0 16px rgba(56,189,248,0.5)" : "none",
                transition: "all 0.2s",
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "9px",
                whiteSpace: "nowrap",
              }}
            >
              {data.labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Period Selector ───────────────────────────────────────────────
function PeriodTab({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
      style={
        active
          ? {
              background: "rgba(56,189,248,0.15)",
              border: "1px solid rgba(56,189,248,0.35)",
              color: "#38bdf8",
            }
          : {
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.4)",
            }
      }
    >
      {label}
    </button>
  );
}

// ── Status Badge ──────────────────────────────────────────────────
const STATUS_STYLES = {
  Delivered: { bg: "rgba(34,197,94,0.12)", color: "#4ade80", border: "rgba(34,197,94,0.3)" },
  "In Transit": { bg: "rgba(56,189,248,0.12)", color: "#38bdf8", border: "rgba(56,189,248,0.3)" },
  Pending: { bg: "rgba(234,179,8,0.12)", color: "#fbbf24", border: "rgba(234,179,8,0.3)" },
  Failed: { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
};

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  );
}

// ── Section ───────────────────────────────────────────────────────
function Section({ title, action, children }) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-sm font-bold tracking-wide"
          style={{ color: "#fff" }}
        >
          {title}
        </h3>
        {action && (
          <button
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              color: "#38bdf8",
              background: "rgba(56,189,248,0.1)",
              border: "1px solid rgba(56,189,248,0.25)",
            }}
          >
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Mock Deliveries ───────────────────────────────────────────────
const RECENT_DELIVERIES = [
  { id: "#DL7821", address: "12 MG Road, Kolkata", time: "10:42 AM", earning: "₹85", status: "Delivered" },
  { id: "#DL7820", address: "45 Park St, Kolkata",  time: "09:18 AM", earning: "₹120", status: "Delivered" },
  { id: "#DL7819", address: "8 Lake View, Howrah",  time: "08:55 AM", earning: "₹65", status: "Delivered" },
  { id: "#DL7818", address: "22 Salt Lake, Kolkata", time: "Yesterday", earning: "₹95", status: "Delivered" },
  { id: "#DL7817", address: "5 Tollygunge, Kolkata", time: "Yesterday", earning: "₹110", status: "Failed" },
];

const ACTIVE_DELIVERIES = [
  { id: "#DL7822", customer: "Arjun Das",    address: "77 New Town, Kolkata", items: 2, earning: "₹140", status: "In Transit" },
  { id: "#DL7823", customer: "Priya Sharma", address: "3 Ballygunge, Kolkata", items: 1, earning: "₹75",  status: "Pending"    },
];

// ── Route map strip ───────────────────────────────────────────────
function RouteStrip({ from, to }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }}
      />
      <div
        className="flex-1 h-px"
        style={{
          background:
            "repeating-linear-gradient(90deg,rgba(56,189,248,0.5) 0,rgba(56,189,248,0.5) 4px,transparent 4px,transparent 8px)",
        }}
      />
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
      />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function DeliveryDashboard() {
  const [period, setPeriod] = useState("day");
  const eData = EARNINGS_DATA[period];

  const periodLabel = {
    day: "Today",
    month: "This Month",
    year: "This Year",
    alltime: "All Time",
  }[period];

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>
          Dashboard
        </h1>
        <p
          className="text-sm mt-0.5"
          style={{ color: "rgba(255,255,255,0.38)" }}
        >
          Welcome back, Rider — here's your delivery summary.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Today's Earnings"
          value="₹3,420"
          change="12.5%"
          positive
          accent="#38bdf8"
          spark={[3, 6, 4, 9, 7, 11, 9, 13, 12, 15]}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          }
        />
        <StatCard
          label="Delivered Today"
          value="6"
          change="2 more"
          positive
          accent="#4ade80"
          spark={[1, 2, 2, 3, 3, 4, 4, 5, 5, 6]}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          }
        />
        <StatCard
          label="All Time Deliveries"
          value="2,481"
          change="18 this week"
          positive
          accent="#f5c542"
          spark={[5, 8, 7, 11, 9, 13, 12, 15, 14, 17]}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          }
        />
        <StatCard
          label="Rating"
          value="4.8 ★"
          change="Top Rider"
          positive
          accent="#fb923c"
          spark={[4, 4.2, 4.5, 4.3, 4.6, 4.7, 4.5, 4.8, 4.7, 4.8]}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          }
        />
      </div>

      {/* ── Earnings Chart + Active Deliveries ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">

        {/* Earnings chart */}
        <div className="lg:col-span-3">
          <Section title="Earnings Overview">
            {/* Period tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { key: "day", label: "Today" },
                { key: "month", label: "This Month" },
                { key: "year", label: "This Year" },
                { key: "alltime", label: "All Time" },
              ].map((t) => (
                <PeriodTab
                  key={t.key}
                  active={period === t.key}
                  label={t.label}
                  onClick={() => setPeriod(t.key)}
                />
              ))}
            </div>

            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                  {eData.total}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#4ade80" }}>
                  {eData.positive ? "▲" : "▼"} {eData.change} — {periodLabel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: "#fff" }}>
                  {eData.deliveries}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  Deliveries
                </p>
              </div>
            </div>

            <EarningsChart period={period} />
          </Section>
        </div>

        {/* Active deliveries */}
        <div className="lg:col-span-2">
          <Section title="Active Deliveries">
            {ACTIVE_DELIVERIES.length === 0 ? (
              <p
                className="text-sm text-center py-8"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                No active deliveries right now.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {ACTIVE_DELIVERIES.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(56,189,248,0.05)",
                      border: "1px solid rgba(56,189,248,0.15)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p
                          className="text-xs font-bold"
                          style={{ color: "#38bdf8" }}
                        >
                          {d.id}
                        </p>
                        <p
                          className="text-sm font-semibold mt-0.5"
                          style={{ color: "#fff" }}
                        >
                          {d.customer}
                        </p>
                      </div>
                      <Badge status={d.status} />
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      {d.address}
                    </p>
                    <RouteStrip />
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.38)" }}
                      >
                        {d.items} item{d.items > 1 ? "s" : ""}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#4ade80" }}
                      >
                        {d.earning}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>

      {/* ── Recent Deliveries + Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent deliveries table */}
        <Section title="Recent Deliveries" action="View All">
          <div className="flex flex-col gap-1">
            {RECENT_DELIVERIES.map((d) => (
              <div
                key={d.id}
                className="flex items-center gap-3 py-2.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: "rgba(56,189,248,0.12)", color: "#38bdf8" }}
                >
                  {d.id.slice(-2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: "#fff" }}
                  >
                    {d.id}
                  </p>
                  <p
                    className="text-xs truncate"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {d.address}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className="text-xs font-semibold mb-1"
                    style={{ color: "#4ade80" }}
                  >
                    {d.earning}
                  </p>
                  <Badge status={d.status} />
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Performance summary */}
        <Section title="Performance Summary">
          <div className="flex flex-col gap-4">

            {/* Success rate */}
            {[
              { label: "Delivery Success Rate", pct: 94, color: "#4ade80", value: "94%" },
              { label: "On-Time Deliveries",     pct: 87, color: "#38bdf8", value: "87%" },
              { label: "Customer Satisfaction",  pct: 96, color: "#f5c542", value: "4.8/5" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <p
                    className="text-xs font-medium"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-xs font-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </p>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.pct}%`,
                      background: `linear-gradient(90deg,${item.color},${item.color}88)`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div
              className="grid grid-cols-3 gap-3 mt-2 pt-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              {[
                { label: "This Week", value: "18" },
                { label: "This Month", value: "74" },
                { label: "All Time", value: "2,481" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: "rgba(56,189,248,0.07)",
                    border: "1px solid rgba(56,189,248,0.13)",
                  }}
                >
                  <p
                    className="text-lg font-bold"
                    style={{ color: "#38bdf8" }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "rgba(255,255,255,0.38)", fontSize: "10px" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}