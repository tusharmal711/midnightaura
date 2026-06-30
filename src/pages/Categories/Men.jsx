import { useState, useEffect } from "react";
import ProductCard from "../../components/ProductCard";
import { API } from "../../api";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
const LIMIT = 10;

// Skeleton matches exact ProductCard DOM: image block + name line + price line
function ProductCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden">
      {/* Image placeholder — same aspect ratio as real card */}
      <div
        className="w-full rounded-xl"
        style={{
          aspectRatio: "3/4",
          background:
            "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
          backgroundSize: "600px 100%",
          animation: "sk-shimmer 1.4s infinite linear",
        }}
      />
      {/* Name line */}
      <div className="mt-2 px-1 space-y-1.5">
        <div
          style={{
            height: 13,
            width: "72%",
            borderRadius: 6,
            background:
              "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
            backgroundSize: "600px 100%",
            animation: "sk-shimmer 1.4s infinite linear",
          }}
        />
        {/* Price line — two blocks side by side (original + discounted) */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div
            style={{
              height: 12,
              width: 40,
              borderRadius: 6,
              background:
                "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
              backgroundSize: "600px 100%",
              animation: "sk-shimmer 1.4s infinite linear",
            }}
          />
          <div
            style={{
              height: 13,
              width: 50,
              borderRadius: 6,
              background:
                "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
              backgroundSize: "600px 100%",
              animation: "sk-shimmer 1.4s infinite linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}

const Men = () => {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
const location = useLocation();

  const isDashboard = location.pathname.startsWith("/user/dashboard");
  const fetchMenProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await API.get("/productBuy/fetchProductByCategory", {
        params: {
          category: "Men",
          page:     pageNum,
          limit:    LIMIT,
        },
      });

      if (res.data.success) {
        setProducts(res.data.data.products);
        setTotalPages(res.data.data.totalPages);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      console.error(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenProducts(page);
  }, [page]);

  // Shape each product so ProductCard gets:
  //   product.name, product.price (original), product.finalPrice (discounted), product.image
  const shaped = products.map((p) => ({
    ...p,
    price:      p.price,       // original — card will strike this through
    finalPrice: p.finalPrice,  // discounted — card shows this as main price
    image:      p.image,
  }));

  return (
    <>
    <Helmet>
  <title>Men's T-Shirts Collection | ChomokTomok</title>

  <meta
    name="description"
    content="Shop premium men's T-shirts, printed T-shirts, oversized T-shirts, hoodies and fashion wear online at ChomokTomok."
  />

  <meta
    name="keywords"
    content="men tshirts, men's t shirts, printed tshirts, oversized tshirts, hoodies, cotton tshirts, fashion wear, ChomokTomok"
  />

  <meta
    name="robots"
    content={isDashboard ? "noindex,nofollow" : "index,follow"}
  />

  <link
    rel="canonical"
    href="https://chomoktomok.com/categories/men"
  />

  <meta
    property="og:title"
    content="Men's T-Shirts Collection | ChomokTomok"
  />

  <meta
    property="og:description"
    content="Discover premium men's T-shirts and fashion wear at ChomokTomok."
  />

  <meta
    property="og:image"
    content="https://chomoktomok.com/Images/chomoktomok-og.png"
  />

  <meta
    property="og:url"
    content="https://chomoktomok.com/categories/men"
  />

  <meta property="og:type" content="website" />

  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="Men's T-Shirts Collection | ChomokTomok"
  />

  <meta
    name="twitter:description"
    content="Buy premium men's T-shirts online from ChomokTomok."
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
            Men's Collection
          </h2>
          {!loading && total > 0 && (
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              {total} products
            </span>
          )}
        </div>

        {/* Grid — skeletons while loading, real cards when done */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: LIMIT }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : shaped.map((p, i) => (
                <ProductCard key={p.id ?? i} product={p} />
              ))}
        </div>

        {/* Empty state */}
        {!loading && products.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <svg
              width="44" height="44" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="1.5"
              className="mb-3 opacity-40"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <p className="text-sm">No products found in Men's collection.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div
            className="flex items-center justify-center gap-2 mt-8 flex-wrap"
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(255,255,255,0.05)",
                border:     "1px solid rgba(255,255,255,0.08)",
                color:      page === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                cursor:     page === 1 ? "not-allowed" : "pointer",
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-9 h-9 rounded-xl text-sm font-semibold"
                style={{
                  background: p === page
                    ? "linear-gradient(135deg,#7c3aed,#6d28d9)"
                    : "rgba(255,255,255,0.04)",
                  color:  p === page ? "#fff" : "rgba(255,255,255,0.55)",
                  border: p === page
                    ? "1px solid rgba(139,92,246,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: p === page ? "0 4px 14px rgba(109,40,217,0.35)" : "none",
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: "rgba(255,255,255,0.05)",
                border:     "1px solid rgba(255,255,255,0.08)",
                color:      page === totalPages ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                cursor:     page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next →
            </button>
          </div>
        )}

      </div>
    </>
  );
};

export default Men;