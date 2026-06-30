import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "../../components/ProductCard";
import { API } from "../../api";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
const LIMIT = 10;

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
      <div
        className="w-full rounded-xl"
        style={{ aspectRatio: "1/1", ...shimmer }}
      />
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

const NewArrivals = () => {
  const [products, setProducts]     = useState([]);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
const location = useLocation();

  const isDashboard = location.pathname.startsWith("/user/dashboard");
  // Sentinel div watched by IntersectionObserver
  const sentinelRef   = useRef(null);
  const isFetchingRef = useRef(false); // prevent duplicate in-flight requests

  const hasMore = totalPages === null || page <= totalPages;

  const fetchPage = useCallback(async (pageNum) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);

    try {
      const res = await API.get("/productBuy/fetchProductByCategory", {
        params: { newArrivals: true, page: pageNum, limit: LIMIT },
      });

      if (res.data.success) {
        const { products: fetched, totalPages: tp, total: t } = res.data.data;
        setProducts((prev) => [...prev, ...fetched]);
        setTotalPages(tp);
        setTotal(t);
      }
    } catch (err) {
      console.error(err.response?.data?.message || "Failed to fetch new arrivals");
    } finally {
      setLoading(false);
      setInitialLoad(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Fetch whenever page number advances
  useEffect(() => {
    if (hasMore) fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // IntersectionObserver — load next page when sentinel comes into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" } // trigger 200px before reaching the bottom
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const allLoaded = !loading && totalPages !== null && page > totalPages;

  return (
    <>
    <Helmet>
  <title>New Arrivals | Latest Fashion Collection | ChomokTomok</title>

  <meta
    name="description"
    content="Discover the latest new arrivals at ChomokTomok. Shop newly added T-shirts, oversized T-shirts, hoodies, kids wear, earrings, necklaces and more."
  />

  <meta
    name="keywords"
    content="new arrivals, latest fashion, new t shirts, new hoodies, oversized t shirts, fashion accessories, ChomokTomok"
  />

  <meta
    name="robots"
    content={isDashboard ? "noindex,nofollow" : "index,follow"}
  />

  <link
    rel="canonical"
    href="https://chomoktomok.com/new-arrivals"
  />

  <meta
    property="og:title"
    content="New Arrivals | ChomokTomok"
  />

  <meta
    property="og:description"
    content="Explore the latest fashion arrivals at ChomokTomok."
  />

  <meta
    property="og:image"
    content="https://chomoktomok.com/Images/chomoktomok-og.png"
  />

  <meta
    property="og:url"
    content="https://chomoktomok.com/new-arrivals"
  />

  <meta property="og:type" content="website" />

  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="New Arrivals | ChomokTomok"
  />

  <meta
    name="twitter:description"
    content="Shop the newest fashion products added to ChomokTomok."
  />

  <meta
    name="twitter:image"
    content="https://chomoktomok.com/Images/chomoktomok-og.png"
  />
</Helmet>
      <style>{`
        @keyframes sk-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
      `}</style>

      <div className="px-4 py-6 max-w-screen-xl mx-auto">

        {/* Heading */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white tracking-wide">
            ✨ New Arrivals
          </h2>
          {!initialLoad && total > 0 && (
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              {total} products
            </span>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {products.map((p, i) => (
            <ProductCard key={p.id ?? i} product={p} />
          ))}

          {/* Skeleton cards appended while fetching the next batch */}
          {loading &&
            Array.from({ length: LIMIT }).map((_, i) => (
              <ProductCardSkeleton key={`sk-${i}`} />
            ))}
        </div>

        {/* Empty state — shown only after the first fetch returns 0 results */}
        {!initialLoad && !loading && products.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <svg
              width="44" height="44" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5"
              className="mb-3 opacity-40"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <p className="text-sm">No new arrivals right now. Check back soon!</p>
          </div>
        )}

        {/* Invisible sentinel — IntersectionObserver anchor */}
        {!allLoaded && <div ref={sentinelRef} style={{ height: 1 }} />}

      

      </div>
    </>
  );
};

export default NewArrivals;