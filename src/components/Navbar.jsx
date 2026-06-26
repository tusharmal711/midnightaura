// Navbar.jsx — Full rewrite: adds Flipkart-style smart search (mobile + desktop)
// while keeping the existing login button, shake tooltip, and login-required modals.
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiHeart,
  FiShoppingCart,
  FiMenu,
  FiX,
  FiSearch,
  FiGrid,
} from "react-icons/fi";
import appLogo from "../assets/images/appImage/chomoktomok-logo.png";
import { API } from "../api";

const BASE_URL = "http://localhost:8008";

// ── Category icon map ────────────────────────────────────────────────────────
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
// `activeIndex` is the flat index (across categories+products) of the
// keyboard-highlighted item. `startIndex` is where this list begins in
// that flat ordering, so each row can compare its own flat index to it.
function CategoryList({ query, suggestions, onSelectCategory, activeIndex, startIndex, registerRef }) {
  return (
    <>
      <div className="px-4 pt-3 pb-1">
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Categories
        </p>
      </div>
      {suggestions.map((s, i) => {
        const flatIndex = startIndex + i;
        const isActive  = flatIndex === activeIndex;
        return (
          <button
            key={s.category}
            ref={(el) => registerRef(flatIndex, el)}
            onClick={() => onSelectCategory(s.route)}
            className="flex items-center justify-between w-full px-4 py-2.5 transition-all text-left"
            style={{ background: isActive ? "rgba(139,92,246,0.18)" : "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = isActive ? "rgba(139,92,246,0.18)" : "transparent"}
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
        );
      })}
    </>
  );
}

// ── ProductList ────────────────────────────────────────────────────────────────
function ProductList({ query, suggestions, onSelectProduct, activeIndex, startIndex, registerRef }) {
  return (
    <>
      <div className="px-4 pt-2 pb-1">
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Products
        </p>
      </div>
      {suggestions.map((p, i) => {
        const imgSrc    = getImgSrc(p.image);
        const flatIndex = startIndex + i;
        const isActive  = flatIndex === activeIndex;
        return (
          <button
            key={p.id}
            ref={(el) => registerRef(flatIndex, el)}
            onClick={() => onSelectProduct(p)}
            className="flex items-center gap-3 w-full px-4 py-2 transition-all text-left"
            style={{ background: isActive ? "rgba(139,92,246,0.16)" : "transparent" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(139,92,246,0.10)"}
            onMouseLeave={e => e.currentTarget.style.background = isActive ? "rgba(139,92,246,0.16)" : "transparent"}
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
// Exposes the flattened, currently-active suggestion list to the parent via
// `onResultsChange` so the navbar's keydown handler can move the highlighted
// index and trigger selection on Enter.
function SearchDropdown({
  query,
  onSelectCategory,
  onSelectProduct,
  onClose,
  isMobile,
  navbarRef,
  activeIndex,
  onResultsChange,
  registerRef,
}) {
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
  const noResults      = results && !hasCategories && !hasProducts && !loading;
  const categoryType   = results?.categorySuggestionsType ?? "none";
  const productsFirst  = categoryType === "derived";

  const handleSelectCategory = (route) => { onSelectCategory(route); onClose(); };
  const handleSelectProduct  = (product) => { onSelectProduct(product); onClose(); };

  // ── Tell the parent the current flattened, ordered list of selectable
  //    items so arrow-key navigation + Enter can work from the input. ──────
  useEffect(() => {
    if (!query.trim()) {
      onResultsChange([]);
      return;
    }
    if (loading || !results) {
      onResultsChange([]);
      return;
    }
    const cats  = results.categorySuggestions  || [];
    const prods = results.productSuggestions   || [];
    const catItems  = cats.map((s)  => ({ type: "category", payload: s.route }));
    const prodItems = prods.map((p) => ({ type: "product",  payload: p }));
    const ordered = productsFirst ? [...prodItems, ...catItems] : [...catItems, ...prodItems];
    onResultsChange(ordered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, loading, productsFirst, query]);

  // ── Default (empty query): Browse Categories only ─────────────────────────
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
      </DropdownShell>
    );
  }

  // Flat start indices for keyboard highlighting, matching the ordering
  // logic above (productsFirst decides which block comes first).
  const catCount  = results?.categorySuggestions?.length ?? 0;
  const prodCount = results?.productSuggestions?.length ?? 0;
  const catStart  = productsFirst ? prodCount : 0;
  const prodStart = productsFirst ? 0 : catCount;

  const categoryBlock = hasCategories && (
    <CategoryList
      key="categories"
      query={query}
      suggestions={results.categorySuggestions}
      onSelectCategory={handleSelectCategory}
      activeIndex={activeIndex}
      startIndex={catStart}
      registerRef={registerRef}
    />
  );
  const productBlock = hasProducts && (
    <ProductList
      key="products"
      query={query}
      suggestions={results.productSuggestions}
      onSelectProduct={handleSelectProduct}
      activeIndex={activeIndex}
      startIndex={prodStart}
      registerRef={registerRef}
    />
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

// ── Main Navbar (logged-out) ──────────────────────────────────────────────────
export default function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCartModal, setShowCartModal]         = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  const [query, setQuery]               = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Keyboard navigation over the flattened suggestion list (categories + products)
  const [activeIndex, setActiveIndex] = useState(-1);
  const [flatResults, setFlatResults] = useState([]); // [{ type: "category"|"product", payload }]
  const itemRefs                      = useRef({});   // flatIndex -> DOM node

  const tooltipTimer    = useRef(null);
  const navigate        = useNavigate();
  const location        = useLocation();
  const desktopInputRef = useRef(null);
  const mobileInputRef  = useRef(null);
  const desktopZoneRef  = useRef(null);
  const mobileZoneRef   = useRef(null);
  // ref to the whole navbar bar — used to measure bottom offset for mobile fixed dropdown
  const navbarBarRef    = useRef(null);

  const isHome = location.pathname === "/";

  // ── Tooltip on home ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHome) { setShowTooltip(false); return; }
    const delay = setTimeout(() => {
      setShowTooltip(true);
      tooltipTimer.current = setTimeout(() => setShowTooltip(false), 8000);
    }, 800);
    return () => { clearTimeout(delay); clearTimeout(tooltipTimer.current); };
  }, [isHome]);

  const dismissTooltip = () => {
    setShowTooltip(false);
    clearTimeout(tooltipTimer.current);
  };

  // ── Focus mobile input when search bar expands ────────────────────────────
  useEffect(() => {
    if (searchOpen && mobileInputRef.current) {
      setTimeout(() => mobileInputRef.current?.focus(), 80);
    }
  }, [searchOpen]);

  // ── Close dropdown / mobile search on outside click ───────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (desktopZoneRef.current && !desktopZoneRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchOpen && mobileZoneRef.current && !mobileZoneRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // ── Reset keyboard highlight whenever the suggestion list itself changes ──
  useEffect(() => {
    setActiveIndex(-1);
  }, [flatResults]);

  // ── Keep the highlighted row scrolled into view ───────────────────────────
  useEffect(() => {
    if (activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const registerRef = useCallback((index, el) => {
    itemRefs.current[index] = el;
  }, []);

  // ── Navigation helpers ─────────────────────────────────────────────────────
  const handleSelectCategory = useCallback((route) => {
    setDropdownOpen(false);
    setQuery("");
    if (route) {
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

  // ── Selecting whichever item is currently highlighted by the keyboard ─────
  const selectActiveItem = useCallback(() => {
    const item = flatResults[activeIndex];
    if (!item) return false;
    if (item.type === "category") {
      handleSelectCategory(item.payload);
    } else if (item.type === "product") {
      handleSelectProduct(item.payload);
    }
    return true;
  }, [flatResults, activeIndex, handleSelectCategory, handleSelectProduct]);

  const handleQueryChange = (val) => {
    setQuery(val);
    setDropdownOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      if (flatResults.length === 0) return;
      e.preventDefault();
      setDropdownOpen(true);
      setActiveIndex((prev) => (prev + 1 >= flatResults.length ? 0 : prev + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      if (flatResults.length === 0) return;
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? flatResults.length - 1 : prev - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      // If a suggestion is highlighted via keyboard, select it.
      // Otherwise fall back to a plain text search submit.
      const handled = selectActiveItem();
      if (!handled) handleSearchSubmit(query);
      return;
    }
    if (e.key === "Escape") {
      setDropdownOpen(false);
      setQuery("");
      setActiveIndex(-1);
    }
  };

  const openMobileSearch = () => {
    setSearchOpen(true);
    setMenuOpen(false);
    setDropdownOpen(true);
  };

  const closeMobileSearch = () => {
    setSearchOpen(false);
    setDropdownOpen(false);
    setQuery("");
  };

  // ── Shared login-required modal ──────────────────────────────────────────────
  const LoginModal = ({ icon: Icon, itemLabel, onClose }) => (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        style={{
          width: "420px", maxWidth: "90%",
          background: "linear-gradient(180deg,#111827 0%,#0b1020 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "22px", padding: "28px",
          boxShadow: "0 20px 60px rgba(0,0,0,.5)",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 34, height: 34, borderRadius: "50%",
            border: "1px solid rgba(255,255,255,.1)",
            background: "rgba(255,255,255,.04)",
            color: "#fff", cursor: "pointer", fontSize: "18px",
          }}
        >✕</button>

        {/* Icon circle */}
        <div style={{
          width: 70, height: 70, borderRadius: "50%",
          margin: "0 auto 18px", display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg,#7c3aed,#ec4899)",
        }}>
          <Icon size={30} color="#fff" />
        </div>

        <h2 style={{ color: "#fff", textAlign: "center", fontSize: "24px", fontWeight: 700, marginBottom: "10px" }}>
          Login Required
        </h2>
        <p style={{ color: "rgba(255,255,255,.7)", textAlign: "center", lineHeight: 1.6, marginBottom: "24px" }}>
          Please login to access your {itemLabel} and continue shopping.
        </p>

        <button
          onClick={() => { onClose(); navigate("/login"); }}
          style={{
            width: "100%", padding: "14px", border: "none",
            borderRadius: "14px", cursor: "pointer",
            color: "#fff", fontWeight: 700, fontSize: "15px",
            background: "linear-gradient(90deg,#7c3aed,#ec4899)",
          }}
        >
          Login Now
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .search-input::placeholder { color: rgba(255,255,255,0.3); }
        .search-input:focus { outline: none; border-color: rgba(168,85,247,0.6) !important; box-shadow: 0 0 0 3px rgba(168,85,247,0.12); }
        @keyframes shakePulse {
          0%   { transform: translateX(-50%); }
          4%   { transform: translateX(calc(-50% - 5px)); }
          8%   { transform: translateX(calc(-50% + 5px)); }
          12%  { transform: translateX(calc(-50% - 4px)); }
          16%  { transform: translateX(calc(-50% + 4px)); }
          20%  { transform: translateX(calc(-50% - 3px)); }
          24%  { transform: translateX(calc(-50% + 3px)); }
          28%  { transform: translateX(calc(-50% - 2px)); }
          32%  { transform: translateX(calc(-50% + 2px)); }
          36%  { transform: translateX(calc(-50% - 1px)); }
          40%  { transform: translateX(-50%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .tooltip-shake { animation: shakePulse 2.5s ease infinite; }
      `}</style>

      <div
        ref={navbarBarRef}
        className="sticky top-0 z-50 relative"
        style={{ background: "#0B0F1A", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >

        {/* ── Modals ── */}
        {showCartModal     && <LoginModal icon={FiShoppingCart} itemLabel="cart items"     onClose={() => setShowCartModal(false)} />}
        {showWishlistModal && <LoginModal icon={FiHeart}        itemLabel="wishlist items" onClose={() => setShowWishlistModal(false)} />}

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
                activeIndex={activeIndex}
                onResultsChange={setFlatResults}
                registerRef={registerRef}
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
                    activeIndex={activeIndex}
                    onResultsChange={setFlatResults}
                    registerRef={registerRef}
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

          {/* ── Right side ── */}
          <div className={`flex items-center gap-3 ml-auto ${searchOpen ? "hidden md:flex" : ""}`}>

            {/* Mobile search trigger */}
            <button
              className="md:hidden flex items-center justify-center transition-colors shrink-0"
              style={{ color: "rgba(255,255,255,0.7)" }}
              aria-label="Open search"
              onClick={openMobileSearch}
            >
              <FiSearch size={20} />
            </button>

            {/* Login button — always visible */}
            <div className="relative">
              <button
                onClick={() => { dismissTooltip(); navigate("/login"); }}
                className="flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:shadow-pink-500/40 transition whitespace-nowrap shrink-0"
              >
                Login
              </button>

              {/* Shake tooltip — desktop only */}
              {showTooltip && (
                <div
                  className="tooltip-shake absolute z-50 hidden md:block"
                  style={{ top: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)" }}
                >
                  <div className="mx-auto" style={{
                    width: 0, height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderBottom: "8px solid white",
                  }} />
                  <div
                    onClick={() => { dismissTooltip(); navigate("/login"); }}
                    className="cursor-pointer bg-white text-[#3730a3] font-bold text-sm px-6 py-2.5 rounded-md shadow-2xl whitespace-nowrap hover:bg-purple-50 transition-colors select-none"
                  >
                    Login
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist — desktop only */}
            <button
              onClick={() => setShowWishlistModal(true)}
              className="hidden md:flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={e => e.currentTarget.style.color = "#f472b6"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
            >
              <FiHeart className="w-5 h-5 shrink-0" />
              Wishlist
            </button>

            {/* Cart — desktop only */}
            <button
              onClick={() => setShowCartModal(true)}
              className="hidden md:flex relative items-center gap-1.5 text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={e => e.currentTarget.style.color = "#c4b5fd"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
            >
              <FiShoppingCart className="w-5 h-5 shrink-0" />
              Cart
            </button>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden text-white leading-none shrink-0"
              aria-label="Toggle menu"
              onClick={() => { setMenuOpen((o) => !o); setSearchOpen(false); setDropdownOpen(false); setQuery(""); }}
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {menuOpen && (
          <div className="md:hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>

            {/* Wishlist + Cart row */}
            <div className="flex items-center gap-6 px-4 pt-3 pb-3">
              <button
                onClick={() => { setShowWishlistModal(true); setMenuOpen(false); }}
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.8)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#f472b6"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
              >
                <FiHeart className="w-5 h-5 shrink-0" />
                Wishlist
              </button>

              <button
                onClick={() => { setShowCartModal(true); setMenuOpen(false); }}
                className="flex items-center gap-2 text-sm transition relative"
                style={{ color: "rgba(255,255,255,0.8)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#c4b5fd"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
              >
                <FiShoppingCart className="w-5 h-5 shrink-0" />
                Cart
              </button>
            </div>

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "0 16px" }} />

            {/* Categories — text only, no icons (matches original) */}
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
                          ? "rgba(109,40,217,0.5)"
                          : "transparent",
                      color: cat.special
                        ? "#34d399"
                        : isActive
                          ? "#ffffff"
                          : "rgba(255,255,255,0.7)",
                    }}
                    onMouseEnter={e => { if (!isActive && !cat.special) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={e => { if (!isActive && !cat.special) e.currentTarget.style.background = "transparent"; }}
                  >
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