import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { API } from "../api";
import tshirt1  from "../assets/images/products/tshirt1.png";
import tshirt2  from "../assets/images/products/tshirt2.png";
import tshirt3  from "../assets/images/products/tshirt3.png";
import tshirt4  from "../assets/images/products/tshirt4.png";
import tshirt6  from "../assets/images/products/tshirt6.png";
import tshirt7  from "../assets/images/products/tshirt7.png";
import tshirt8  from "../assets/images/products/tshirt8.png";
import tshirt9  from "../assets/images/products/tshirt9.png";
import tshirt10 from "../assets/images/products/tshirt10.png";

// ── Static data ───────────────────────────────────────────────────────────────

const trendingProducts = [
  { name: "Uchiha Itachi Tee", price: 799, color: "#0d0a0a", graphic: "ウラン", image: tshirt1  },
  { name: "Shadow Hunter Tee", price: 849, color: "#0a0a0d", graphic: "Strals", image: tshirt2  },
  { name: "Moon Aura Tee",     price: 749, color: "#08080d", graphic: "○",      image: tshirt3  },
  { name: "Tokyo Drift Tee",   price: 799, color: "#0d0a08", graphic: "東京",   image: tshirt4  },
  { name: "Dark Street Tee",   price: 899, color: "#0a0808", graphic: "市",     image: tshirt10 },
];

// Sections backed by static data — no API call
const STATIC_SECTIONS = {
  "🔥 Trending Now": trendingProducts,
};

// "✨ New Arrivals" is a special dynamic section:
//   - hits the API with newArrivals=true (last 30 days, newest first)
//   - hides entirely when the API returns 0 products
const NEW_ARRIVALS_TITLE = "✨ New Arrivals";

// Map every other API-backed section title → category value
const CATEGORY_MAP = {
  "Men":       "Men",
  "Women":     "Women",
  "Kids":      "Kids",
  "Earrings":  "Earrings",
  "Necklaces": "Necklaces",
  "Oversized": "Oversized",
  "Hoodies":   "Hoodies",
};

// ── Hook: detect mobile (< 640px) ────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  const shimmer = {
    background:
      "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
    backgroundSize: "600px 100%",
    animation: "sk-shimmer 1.4s infinite linear",
  };

  return (
    <div className="rounded-xl overflow-hidden">
      <div style={{ aspectRatio: "1/1", width: "100%", borderRadius: 12, ...shimmer }} />
      <div className="mt-2 px-1 space-y-1.5">
        <div style={{ height: 13, width: "72%", borderRadius: 6, ...shimmer }} />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ height: 13, width: 50, borderRadius: 6, ...shimmer }} />
          <div style={{ height: 12, width: 40, borderRadius: 6, ...shimmer }} />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ProductSection({ title, icon, link }) {
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  // How many items to show / fetch
  const limit = isMobile ? 4 : 5;

  const isStatic      = title in STATIC_SECTIONS;
  const isNewArrivals = title === NEW_ARRIVALS_TITLE;
  const apiCategory   = CATEGORY_MAP[title] ?? null;

  // For static sections, slice to the right limit so mobile shows 4
  const [products, setProducts] = useState(
    isStatic ? STATIC_SECTIONS[title].slice(0, limit) : []
  );
  const [loading,  setLoading]  = useState(!isStatic);
  const [hidden,   setHidden]   = useState(false);

  // Re-slice static data when limit changes (mobile ↔ desktop resize)
  useEffect(() => {
    if (isStatic) {
      setProducts(STATIC_SECTIONS[title].slice(0, limit));
    }
  }, [limit, isStatic, title]);

  // Fetch dynamic data; re-fetch when limit changes so the count stays correct
  useEffect(() => {
    if (isStatic) return;

    const fetchProducts = async () => {
      setLoading(true);
      setHidden(false);

      try {
        const params = isNewArrivals
          ? { newArrivals: true, page: 1, limit }
          : { category: apiCategory, page: 1, limit };

        const res = await API.get("/productBuy/fetchProductByCategory", { params });

        if (res.data.success) {
          const fetched = res.data.data.products;
          if (isNewArrivals && fetched.length === 0) {
            setHidden(true);
          } else {
            setProducts(fetched);
          }
        }
      } catch (err) {
        console.error(err.response?.data?.message || `Failed to fetch ${title}`);
        if (isNewArrivals) setHidden(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [title, apiCategory, isStatic, isNewArrivals, limit]);

  // ── Hide the whole section (New Arrivals with 0 results) ──────────────────
  if (hidden) return null;

  return (
    <>
      <style>{`
        @keyframes sk-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
      `}</style>

      <div className="px-4 py-5 max-w-screen-xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon && <span className="text-white">{icon}</span>}
            <h2 className="text-lg font-bold text-white tracking-wide">{title}</h2>
          </div>
          <button
            onClick={() => link && navigate(link)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            View All
          </button>
        </div>

        {/* Grid — 2 cols on mobile, scales up on larger screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: limit }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p, i) => <ProductCard key={p.id ?? i} product={p} />)
          }
        </div>

        {/* Empty state — only for regular API sections (not New Arrivals, which hides entirely) */}
        {!loading && !isStatic && !isNewArrivals && products.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-12"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <p className="text-sm">No products found.</p>
          </div>
        )}

      </div>
    </>
  );
}