// UserNavbar.jsx — Full rewrite with Flipkart-style smart search (mobile + desktop)
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiUser,
  FiHeart,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiSearch,
  FiTag,
  FiGrid,
  FiArrowRight,
} from "react-icons/fi";
import Cookies from "js-cookie";
import appLogo from "../assets/images/appImage/chomoktomok-logo.png";
import { API } from "../api";

const BASE_URL = "http://localhost:8008";

// ── Helpers ────────────────────────────────────────────────────────────────────
const getStoredEmail = () => {
  try { const s = localStorage.getItem("user"); if (s) { const p = JSON.parse(s); if (p?.email) return p.email; } } catch (_) {}
  try { const c = Cookies.get("user"); if (c) { const p = JSON.parse(c); if (p?.email) return p.email; } } catch (_) {}
  return null;
};

// ── Route map ──────────────────────────────────────────────────────────────────
const ROUTE_MAP = {
  Men:       "/user/dashboard/categories/men",
  Women:     "/user/dashboard/categories/women",
  Kids:      "/user/dashboard/categories/kids",
  Earrings:  "/user/dashboard/categories/earrings",
  Necklaces: "/user/dashboard/categories/necklaces",
  Oversized: "/user/dashboard/categories/oversized",
  Hoodies:   "/user/dashboard/categories/hoodies",
};

// Category icon map
const CAT_ICONS = {
  Men:       "👔",
  Women:     "👗",
  Kids:      "🧒",
  Earrings:  "💎",
  Necklaces: "📿",
  Oversized: "🧥",
  Hoodies:   "🧤",
};

// ── Categories list ────────────────────────────────────────────────────────────
const categories = [
  { label: "For You",           path: "/user/dashboard" },
  { label: "Men",               path: "/user/dashboard/categories/men" },
  { label: "Women",             path: "/user/dashboard/categories/women" },
  { label: "Kids",              path: "/user/dashboard/categories/kids" },
  { label: "Earrings",          path: "/user/dashboard/categories/earrings" },
  { label: "Necklaces",         path: "/user/dashboard/categories/necklaces" },
  { label: "Oversized",         path: "/user/dashboard/categories/oversized" },
  { label: "Hoodies",           path: "/user/dashboard/categories/hoodies" },
  { label: "Customize T-shirt", path: "/user/dashboard/categories/customize", special: true },
];

// ── Debounce hook ──────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ── Price presets ──────────────────────────────────────────────────────────────
const PRICE_PRESETS = [
  { label: "Under ₹299",   minPrice: 0,    maxPrice: 299   },
  { label: "₹300 – ₹599", minPrice: 300,  maxPrice: 599   },
  { label: "₹600 – ₹999", minPrice: 600,  maxPrice: 999   },
  { label: "Above ₹1000", minPrice: 1000, maxPrice: 99999 },
];

// ── Image helper ───────────────────────────────────────────────────────────────
const getImgSrc = (img) => {
  if (!img) return null;
  return img.startsWith("/") ? `${BASE_URL}${img}` : img;
};

// ── HighlightMatch ─────────────────────────────────────────────────────────────
function HighlightMatch({ text, full }) {
  if (!text || !full) return <>{full}</>;
  const idx = full.toLowerCase().indexOf(text.toLowerCase());
  if (idx === -1) return <>{full}</>;
  return (
    <>
      {full.slice(0, idx)}
      <span style={{ color: "#c4b5fd", fontWeight: 700 }}>{full.slice(idx, idx + text.length)}</span>
      {full.slice(idx + text.length)}
    </>
  );
}

// ── CategoryList ───────────────────────────────────────────────────────────────
function CategoryList({ query, suggestions, onSelectCategory }) {
  return (
    <>
      <div className="px-4 pt-3 pb-1">
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Categories
        </p>
      </div>
      {suggestions.map((s) => (
        <button
          key={s.category}
          onClick={() => onSelectCategory(s.route)}
          className="flex items-center justify-between w-full px-4 py-2.5 transition-all text-left"
          onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.12)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: "rgba(168,85,247,0.15)", fontSize: 15 }}>
              {CAT_ICONS[s.category] || "🛒"}
            </span>
            <div>
              <span style={{ color: "#ffffff", fontSize: 13, fontWeight: 500 }}>
                <HighlightMatch text={query} full={s.category} />
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginLeft: 6 }}>
                {s.matchReason}
              </span>
            </div>
          </div>
          <FiGrid size={13} style={{ color: "rgba(139,92,246,0.7)" }} />
        </button>
      ))}
    </>
  );
}

// ── ProductList ────────────────────────────────────────────────────────────────
function ProductList({ query, suggestions, onSelectProduct }) {
  return (
    <>
      <div className="px-4 pt-2 pb-1">
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Products
        </p>
      </div>
      {suggestions.map((p) => {
        const imgSrc = getImgSrc(p.image);
        return (
          <button
            key={p.id}
            onClick={() => onSelectProduct(p)}
            className="flex items-center gap-3 w-full px-4 py-2 transition-all text-left"
            onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.10)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {imgSrc ? (
                <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <FiShoppingCart size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate" style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 500 }}>
                <HighlightMatch text={query} full={p.name} />
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                {CAT_ICONS[p.category]} {p.category}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p style={{ color: "#ffffff", fontSize: 13, fontWeight: 700 }}>
                ₹{p.finalPrice ?? p.price}
              </p>
              {p.discount > 0 && (
                <p style={{ color: "#4ade80", fontSize: 10, fontWeight: 600 }}>
                  {p.discount}% off
                </p>
              )}
            </div>
          </button>
        );
      })}
    </>
  );
}

// ── DropdownShell ──────────────────────────────────────────────────────────────
// On mobile: fixed, spans full viewport width edge-to-edge (left:0, right:0)
// On desktop: absolute, anchored to the search input container
function DropdownShell({ children, isMobile, navbarRef }) {
  const [topOffset, setTopOffset] = useState(0);

  useEffect(() => {
    if (isMobile && navbarRef?.current) {
      const rect = navbarRef.current.getBoundingClientRect();
      setTopOffset(rect.bottom);
    }
  }, [isMobile, navbarRef]);

  if (isMobile) {
    return (
      <div
        style={{
          position:            "fixed",
          top:                 topOffset || 56,
          left:                0,
          right:               0,
          width:               "100vw",
          background:          "rgba(14, 19, 32, 0.98)",
          border:              "none",
          borderTop:           "1px solid rgba(255,255,255,0.1)",
          boxShadow:           "0 20px 60px rgba(0,0,0,0.7)",
          backdropFilter:      "blur(24px)",
          WebkitBackdropFilter:"blur(24px)",
          maxHeight:           "70vh",
          overflowY:           "auto",
          zIndex:              9999,
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        {children}
      </div>
    );
  }

  // Desktop — stays relative to the input wrapper
  return (
    <div
      className="absolute left-0 right-0 rounded-2xl overflow-hidden overflow-y-auto"
      style={{
        top:                 "calc(100% + 6px)",
        background:          "rgba(14, 19, 32, 0.98)",
        border:              "1px solid rgba(255,255,255,0.1)",
        boxShadow:           "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.1)",
        backdropFilter:      "blur(24px)",
        WebkitBackdropFilter:"blur(24px)",
        maxHeight:           420,
        zIndex:              9999,
      }}
      onMouseDown={e => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

// ── SearchDropdown ─────────────────────────────────────────────────────────────
function SearchDropdown({ query, onSelectCategory, onSelectProduct, onClose, isMobile, navbarRef }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const debouncedQ            = useDebounce(query, 280);

  useEffect(() => {
    if (!debouncedQ || debouncedQ.trim().length < 1) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    API.get("/productBuy/search", { params: { q: debouncedQ.trim(), limit: 6 } })
      .then((res) => { if (!cancelled && res.data.success) setResults(res.data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQ]);

  const hasCategories = results?.categorySuggestions?.length > 0;
  const hasProducts   = results?.productSuggestions?.length > 0;
  const noResults     = results && !hasCategories && !hasProducts && !loading;
  const categoryType  = results?.categorySuggestionsType ?? "none";
  const productsFirst = categoryType === "derived";

  const handleSelectCategory = (route) => { onSelectCategory(route); onClose(); };
  const handleSelectProduct  = (product) => { onSelectProduct(product); onClose(); };

  // ── Default (empty query): Browse Categories + Shop by Price ──────────────
  if (!query.trim()) {
    return (
      <DropdownShell isMobile={isMobile} navbarRef={navbarRef}>
        <div className="px-4 pt-3 pb-1">
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Browse Categories
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1 px-3 pb-3">
          {categories.filter(c => !c.special).slice(1).map((cat) => (
            <button
              key={cat.path}
              onClick={() => { onSelectCategory(cat.path); onClose(); }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all"
              style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 16 }}>{CAT_ICONS[cat.label] || "🛒"}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "0 12px" }} />

        <div className="px-4 pt-3 pb-1">
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Shop by Price
          </p>
        </div>
        <div className="flex flex-col px-3 pb-3 gap-0.5">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => { onSelectCategory(null, preset); onClose(); }}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all"
              style={{ color: "rgba(255,255,255,0.65)", fontSize: 13 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; e.currentTarget.style.color = "#c4b5fd"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
            >
              <div className="flex items-center gap-2.5">
                <FiTag size={13} style={{ color: "#a855f7" }} />
                <span>{preset.label}</span>
              </div>
              <FiArrowRight size={12} style={{ color: "rgba(255,255,255,0.25)" }} />
            </button>
          ))}
        </div>
      </DropdownShell>
    );
  }

  const categoryBlock = hasCategories && (
    <CategoryList key="categories" query={query} suggestions={results.categorySuggestions} onSelectCategory={handleSelectCategory} />
  );
  const productBlock = hasProducts && (
    <ProductList key="products" query={query} suggestions={results.productSuggestions} onSelectProduct={handleSelectProduct} />
  );
  const divider = hasCategories && hasProducts && (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "6px 12px" }} />
  );

  return (
    <DropdownShell isMobile={isMobile} navbarRef={navbarRef}>
      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin w-5 h-5" style={{ color: "#a855f7" }} fill="none" viewBox="0 0 24 24">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {!loading && productsFirst && <>{productBlock}{divider}{categoryBlock}</>}
      {!loading && !productsFirst && <>{categoryBlock}{divider}{productBlock}</>}

      {/* Price presets always shown while searching */}
      {!loading && query && (
        <>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", margin: "6px 12px" }} />
          <div className="px-4 pt-1 pb-1">
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Shop by Price
            </p>
          </div>
          <div className="flex flex-col px-3 pb-3 gap-0.5">
            {PRICE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => { onSelectCategory(null, preset); onClose(); }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-left transition-all"
                style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; e.currentTarget.style.color = "#c4b5fd"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
              >
                <FiTag size={11} style={{ color: "#a855f7" }} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* No results */}
      {noResults && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <span style={{ fontSize: 32, marginBottom: 8 }}>🔍</span>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textAlign: "center" }}>
            No results for <strong style={{ color: "rgba(255,255,255,0.7)" }}>"{query}"</strong>
          </p>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>
            Try browsing a category instead
          </p>
        </div>
      )}
    </DropdownShell>
  );
}

// ── Main Navbar ────────────────────────────────────────────────────────────────
export default function UserNavbar() {
  const [cartCount, setCartCount]       = useState(0);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [query, setQuery]               = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate        = useNavigate();
  const location        = useLocation();
  const intervalRef     = useRef(null);
  const desktopInputRef = useRef(null);
  const mobileInputRef  = useRef(null);
  const desktopZoneRef  = useRef(null);
  const mobileZoneRef   = useRef(null);
  // ref to the whole navbar bar — used to measure bottom offset for mobile fixed dropdown
  const navbarBarRef    = useRef(null);

  // ── Cart count polling ─────────────────────────────────────────────────────
  const fetchCartCount = async () => {
    try {
      const email = getStoredEmail();
      if (!email) return;
      const profileRes = await API.post("/user/getProfile", { email });
      if (!profileRes.data.success) return;
      const customerId = profileRes.data.user?.customerId;
      if (!customerId) return;
      const cartRes = await API.get(`/cart/getCart/${customerId}`);
      if (cartRes.data.success) {
        const count = cartRes.data.summary?.totalItems ?? cartRes.data.data?.length ?? 0;
        setCartCount(count);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchCartCount();
    intervalRef.current = setInterval(fetchCartCount, 2000);
    return () => clearInterval(intervalRef.current);
  }, []);

  // ── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (desktopZoneRef.current && !desktopZoneRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchOpen && mobileZoneRef.current && !mobileZoneRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // ── Focus mobile input when search bar expands ────────────────────────────
  useEffect(() => {
    if (searchOpen && mobileInputRef.current) {
      setTimeout(() => mobileInputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const handleSelectCategory = useCallback((route, pricePreset = null) => {
    setDropdownOpen(false);
    setQuery("");
    if (pricePreset) {
      navigate("/user/dashboard", { state: { priceFilter: pricePreset } });
    } else if (route) {
      navigate(route);
    }
  }, [navigate]);

  const handleSelectProduct = useCallback((product) => {
    setDropdownOpen(false);
    setQuery("");
    if (product.route) {
      navigate(product.route, {
        state: { highlightProductId: product.id, highlightProductName: product.name },
      });
    }
  }, [navigate]);

  const handleSearchSubmit = useCallback(async (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setDropdownOpen(false);
    setQuery("");
    setSearchOpen(false);
    try {
      const res = await API.get("/productBuy/search", { params: { q: trimmed, limit: 1 } });
      if (res.data.success) {
        const catSugs  = res.data.categorySuggestions;
        const prodSugs = res.data.productSuggestions;
        const catType  = res.data.categorySuggestionsType;
        if (catType === "keyword" && catSugs?.length > 0) {
          navigate(catSugs[0].route, { state: { searchQuery: trimmed } });
        } else if (prodSugs?.length > 0) {
          navigate(prodSugs[0].route, { state: { searchQuery: trimmed, highlightProductId: prodSugs[0].id } });
        } else if (catSugs?.length > 0) {
          navigate(catSugs[0].route, { state: { searchQuery: trimmed } });
        } else {
          navigate("/user/dashboard", { state: { searchQuery: trimmed } });
        }
      }
    } catch (_) {
      navigate("/user/dashboard");
    }
  }, [navigate]);

  const handleQueryChange = (val) => {
    setQuery(val);
    setDropdownOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter")  handleSearchSubmit(query);
    if (e.key === "Escape") { setDropdownOpen(false); setQuery(""); }
  };

  const closeMobileSearch = () => {
    setSearchOpen(false);
    setDropdownOpen(false);
    setQuery("");
  };

  return (
    <>
      <style>{`
        .search-input::placeholder { color: rgba(255,255,255,0.3); }
        .search-input:focus { outline: none; border-color: rgba(168,85,247,0.6) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.12); }
      `}</style>

      <div
        ref={navbarBarRef}
        className="sticky top-0 z-50 relative"
        style={{ background: "#0B0F1A", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* ── Main bar ── */}
        <div className="flex items-center px-4 md:px-6 py-3 max-w-screen-xl mx-auto gap-3">

          {/* Logo */}
          <div
            className={`flex items-center gap-2 cursor-pointer shrink-0 ${searchOpen ? "hidden md:flex" : ""}`}
            onClick={() => navigate("/")}
          >
            <img src={appLogo} alt="app-logo" className="h-10 md:h-10 w-auto" />
          </div>

          {/* ── DESKTOP Search ── */}
          <div ref={desktopZoneRef} className="hidden md:flex flex-1 mx-4 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: dropdownOpen ? "#a855f7" : "rgba(255,255,255,0.35)", transition: "color 0.2s" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={desktopInputRef}
              className="search-input w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white"
              style={{
                background: "rgba(255,255,255,0.05)",
                border:     `1px solid ${dropdownOpen ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.1)"}`,
                transition: "border-color 0.2s",
              }}
              placeholder="Search for T-shirts, Earrings, Hoodies..."
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              onFocus={() => setDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            {query && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onClick={() => { setQuery(""); desktopInputRef.current?.focus(); }}
              >
                <FiX size={14} />
              </button>
            )}
            {dropdownOpen && (
              <SearchDropdown
                query={query}
                onSelectCategory={handleSelectCategory}
                onSelectProduct={handleSelectProduct}
                onClose={() => setDropdownOpen(false)}
                isMobile={false}
                navbarRef={navbarBarRef}
              />
            )}
          </div>

          {/* ── MOBILE expanding search bar ── */}
          {searchOpen && (
            <div
              ref={mobileZoneRef}
              className="md:hidden flex items-center flex-1 gap-2 relative"
            >
              <div className="relative flex-1">
                <FiSearch
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#a855f7" }}
                />
                <input
                  ref={mobileInputRef}
                  className="search-input w-full pl-9 pr-8 py-2 rounded-xl text-sm text-white"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border:     "1px solid rgba(168,85,247,0.5)",
                  }}
                  placeholder="Search for T-shirts, Earrings, Hoodies..."
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  onFocus={() => setDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {query && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setQuery(""); mobileInputRef.current?.focus(); }}
                  >
                    <FiX size={14} />
                  </button>
                )}

                {/*
                  ✅ MOBILE Dropdown — rendered as position:fixed, full viewport width.
                     The navbarRef lets DropdownShell measure exactly where the navbar
                     bottom is so it can anchor cleanly right below it.
                */}
                {dropdownOpen && (
                  <SearchDropdown
                    query={query}
                    onSelectCategory={handleSelectCategory}
                    onSelectProduct={handleSelectProduct}
                    onClose={() => {
                      setDropdownOpen(false);
                      setSearchOpen(false);
                      setQuery("");
                    }}
                    isMobile={true}
                    navbarRef={navbarBarRef}
                  />
                )}
              </div>

              {/* Close mobile search */}
              <button
                className="flex items-center justify-center shrink-0"
                style={{ color: "rgba(255,255,255,0.7)" }}
                aria-label="Close search"
                onClick={closeMobileSearch}
              >
                <FiX size={22} />
              </button>
            </div>
          )}

          {/* ── Right icons ── */}
          <div className={`flex items-center gap-3 ml-auto ${searchOpen ? "hidden md:flex" : ""}`}>

            {/* Mobile search trigger */}
            <button
              className="md:hidden flex items-center justify-center transition-colors shrink-0"
              style={{ color: "rgba(255,255,255,0.7)" }}
              aria-label="Open search"
              onClick={() => { setSearchOpen(true); setMenuOpen(false); setDropdownOpen(true); }}
            >
              <FiSearch size={20} />
            </button>

            {/* My Profile */}
            <button
              onClick={() => navigate("/user/profile")}
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white rounded-xl whitespace-nowrap shrink-0 transition-all"
              style={{
                background: "linear-gradient(135deg, #9333ea, #db2777)",
                boxShadow:  "0 4px 15px rgba(219,39,119,0.3)",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(219,39,119,0.5)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 15px rgba(219,39,119,0.3)"}
            >
              <FiUser className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">My Profile</span>
            </button>

            {/* Wishlist — desktop */}
            <button
              onClick={() => navigate("/wishlist")}
              className="hidden md:flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={e => e.currentTarget.style.color = "#f472b6"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
            >
              <FiHeart className="w-5 h-5 shrink-0" />
              Wishlist
            </button>

            {/* Cart — desktop */}
            <button
              onClick={() => navigate("/user/profile/cart")}
              className="hidden md:flex relative items-center gap-1.5 text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={e => e.currentTarget.style.color = "#c4b5fd"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
            >
              <FiShoppingCart className="w-5 h-5 shrink-0" />
              Cart
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-3 text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#9333ea,#db2777)", color: "#fff" }}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* Hamburger — mobile */}
            <button
              className="md:hidden text-white leading-none shrink-0"
              aria-label="Toggle menu"
              onClick={() => { setMenuOpen(o => !o); setSearchOpen(false); setDropdownOpen(false); setQuery(""); }}
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {menuOpen && (
          <div className="md:hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-6 px-4 pt-3 pb-3">
              <button
                onClick={() => { navigate("/wishlist"); setMenuOpen(false); }}
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.8)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#f472b6"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
              >
                <FiHeart className="w-5 h-5 shrink-0" />
                Wishlist
              </button>
              <button
                onClick={() => { navigate("/user/profile/cart"); setMenuOpen(false); }}
                className="flex items-center gap-2 text-sm transition relative"
                style={{ color: "rgba(255,255,255,0.8)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#c4b5fd"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
              >
                <FiShoppingCart className="w-5 h-5 shrink-0" />
                Cart
                {cartCount > 0 && (
                  <span
                    className="absolute -top-2 left-3 text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#9333ea,#db2777)", color: "#fff" }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "0 16px" }} />

            <div className="px-4 pt-3 pb-4 flex flex-col gap-1">
              {categories.map((cat, i) => {
                const isActive = location.pathname === cat.path;
                return (
                  <button
                    key={i}
                    onClick={() => { navigate(cat.path); setMenuOpen(false); }}
                    className="text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: cat.special
                        ? "transparent"
                        : isActive
                          ? "rgba(109,40,217,0.4)"
                          : "transparent",
                      color: cat.special
                        ? "#34d399"
                        : isActive
                          ? "#ffffff"
                          : "rgba(255,255,255,0.65)",
                    }}
                    onMouseEnter={e => { if (!isActive && !cat.special) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={e => { if (!isActive && !cat.special) e.currentTarget.style.background = "transparent"; }}
                  >
                    {cat.special ? null : (CAT_ICONS[cat.label] ? `${CAT_ICONS[cat.label]} ` : "")}
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}