// ListingProducts.jsx
import { useState } from "react";

const PRODUCTS = [
  { id: "MA001", name: "Uchiha Itachi Tee",  category: "T-Shirts",  price: 799,  stock: 142, status: "Active"   },
  { id: "MA002", name: "Moon Aura Tee",       category: "T-Shirts",  price: 749,  stock: 98,  status: "Active"   },
  { id: "MA003", name: "Tokyo Drift Tee",     category: "T-Shirts",  price: 799,  stock: 0,   status: "Out"      },
  { id: "MA004", name: "Shadow Hunter Tee",   category: "T-Shirts",  price: 849,  stock: 56,  status: "Active"   },
  { id: "MA005", name: "Neon Ghost Hoodie",   category: "Hoodies",   price: 1299, stock: 34,  status: "Active"   },
  { id: "MA006", name: "Astral Wave Hoodie",  category: "Hoodies",   price: 1399, stock: 12,  status: "Low"      },
  { id: "MA007", name: "Lunar Drop Earrings", category: "Earrings",  price: 349,  stock: 200, status: "Active"   },
  { id: "MA008", name: "Void Chain Necklace", category: "Necklaces", price: 499,  stock: 0,   status: "Out"      },
  { id: "MA009", name: "Oversized Kanji Tee", category: "Oversized", price: 899,  stock: 67,  status: "Active"   },
  { id: "MA010", name: "Aurora Crop Tee",     category: "Women",     price: 749,  stock: 8,   status: "Low"      },
];

const STATUS_STYLES = {
  Active: { bg: "rgba(34,197,94,0.12)",   color: "#4ade80", border: "rgba(34,197,94,0.3)"   },
  Low:    { bg: "rgba(234,179,8,0.12)",   color: "#fbbf24", border: "rgba(234,179,8,0.3)"   },
  Out:    { bg: "rgba(239,68,68,0.12)",   color: "#f87171", border: "rgba(239,68,68,0.3)"   },
};

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Active;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status === "Out" ? "Out of Stock" : status === "Low" ? "Low Stock" : "Active"}
    </span>
  );
}

export default function ListingProducts() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];
  const filtered = PRODUCTS.filter((p) =>
    (filter === "All" || p.category === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#fff" }}>Listing Products</h1>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
            {PRODUCTS.length} products in your catalogue
          </p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff", boxShadow: "0 4px 16px rgba(124,58,237,0.35)" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-5 mb-4"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID…"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none"
              style={{
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.85)", caretColor: "#a78bfa",
              }} />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button key={c} onClick={() => setFilter(c)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={filter === c
                  ? { background: "linear-gradient(135deg,rgba(139,92,246,0.28),rgba(124,58,237,0.18))", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.4)" }
                  : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }
                }>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-widest"
          style={{ color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          <span className="col-span-1">ID</span>
          <span className="col-span-4">Product</span>
          <span className="col-span-2">Category</span>
          <span className="col-span-2 text-right">Price</span>
          <span className="col-span-1 text-center">Stock</span>
          <span className="col-span-2 text-right">Status</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
            No products found.
          </div>
        ) : (
          filtered.map((p, i) => (
            <div key={p.id}
              className="grid grid-cols-2 sm:grid-cols-12 px-5 py-4 items-center gap-y-1 transition-colors duration-150 group"
              style={{
                borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(139,92,246,0.05)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span className="col-span-1 text-xs font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>{p.id}</span>
              <span className="col-span-4 text-sm font-medium" style={{ color: "#fff" }}>{p.name}</span>
              <span className="col-span-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{p.category}</span>
              <span className="col-span-2 text-sm font-semibold text-right" style={{ color: "#f5c542" }}>₹{p.price}</span>
              <span className="col-span-1 text-sm text-center font-medium"
                style={{ color: p.stock === 0 ? "#f87171" : p.stock < 15 ? "#fbbf24" : "rgba(255,255,255,0.7)" }}>
                {p.stock}
              </span>
              <div className="col-span-2 flex justify-end gap-2 items-center">
                <Badge status={p.status} />
                <button className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}