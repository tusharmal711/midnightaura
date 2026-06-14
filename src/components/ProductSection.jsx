import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import { API } from "../api";

// ── Section type config ──────────────────────────────────────────────────────
// "✨ New Arrivals" and "🔥 Trending Now" are dynamic sections that hide
// entirely when the API returns 0 products.
const NEW_ARRIVALS_TITLE = "✨ New Arrivals";
const TRENDING_TITLE     = "🔥 Trending Now";

// Map every category section title → category value
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

  const isNewArrivals = title === NEW_ARRIVALS_TITLE;
  const isTrending    = title === TRENDING_TITLE;
  const isDynamicHide = isNewArrivals || isTrending; // hides section if 0 results
  const apiCategory   = CATEGORY_MAP[title] ?? null;

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [hidden,   setHidden]   = useState(false);

  // Fetch data; re-fetch when limit changes so the count stays correct
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setHidden(false);

      try {
        const params = isNewArrivals
          ? { newArrivals: true, page: 1, limit }
          : isTrending
          ? { trending: true, page: 1, limit }
          : { category: apiCategory, page: 1, limit };

        const res = await API.get("/productBuy/fetchProductByCategory", { params });

        if (res.data.success) {
          const fetched = res.data.data.products;
          if (isDynamicHide && fetched.length === 0) {
            setHidden(true);
          } else {
            setProducts(fetched);
          }
        }
      } catch (err) {
        console.error(err.response?.data?.message || `Failed to fetch ${title}`);
        if (isDynamicHide) setHidden(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [title, apiCategory, isNewArrivals, isTrending, isDynamicHide, limit]);

  // ── Hide the whole section (New Arrivals / Trending with 0 results) ───────
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

        {/* Empty state — only for regular category sections */}
        {!loading && !isDynamicHide && products.length === 0 && (
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