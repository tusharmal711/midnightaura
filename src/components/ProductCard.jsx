import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
const BASE_URL = "http://localhost:8008";


const SECRET_KEY = "midnightaura_secret_key";
export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const hasDiscount =
    product.discount > 0 &&
    product.finalPrice &&
    product.finalPrice !== product.price;

  // Only prepend BASE_URL if the image is a relative server path (starts with /)
  // Static/local imports and full URLs are used as-is
  const imageUrl = product.image
    ? product.image.startsWith("/")
      ? `${BASE_URL}${product.image}`
      : product.image
    : null;

const handleProductClick = () => {

  if (product.id) {

    // Encrypt ID
    const encryptedId = CryptoJS.AES.encrypt(
      product.id,
      SECRET_KEY
    ).toString();

    // Encode URL safe
    const safeId = encodeURIComponent(encryptedId);

    navigate(`/product-view/${safeId}`);
  }
};

  return (
    <div className="bg-[#141928] border border-white/[0.06] rounded-2xl overflow-hidden group hover:border-purple-500/30 transition-all shadow-lg hover:shadow-purple-900/20">

      {/* Image area */}
      <div
        onClick={handleProductClick}
        className="relative bg-[#0f1420] aspect-square flex items-center justify-center overflow-hidden cursor-pointer"
      >
        {/* Skeleton Loader */}
        {!loaded && (
          <div className="absolute inset-0 bg-white/10 animate-pulse z-10" />
        )}

        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            className={`
              w-full h-full object-cover
              transition-all duration-500
              group-hover:scale-105
              ${loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105"}
            `}
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <svg viewBox="0 0 120 130" width="90" height="100" className="opacity-60">
              <path
                d="M30 8 L18 28 L2 20 L14 50 L20 50 L20 122 L100 122 L100 50 L106 50 L118 20 L102 28 L90 8 Q60 18 30 8Z"
                fill={product.color || "#1a1a2e"}
                stroke="#2a1a4a"
                strokeWidth="1"
              />
              {product.graphic && (
                <text x="60" y="80" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="serif">
                  {product.graphic}
                </text>
              )}
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/5 transition-colors" />
      </div>

      {/* Info */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div
          onClick={handleProductClick}
          className="cursor-pointer flex-1 mr-2"
        >
          <p className="text-sm font-medium text-white/90 leading-tight">
            {product.name}
          </p>

          {/* Price row */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-bold text-white">
              ₹{hasDiscount ? product.finalPrice : product.price}
            </span>
            {hasDiscount && (
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.35)", textDecoration: "line-through" }}
              >
                ₹{product.price}
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs font-semibold" style={{ color: "#4ade80" }}>
                {product.discount}% off
              </span>
            )}
          </div>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
            added
              ? "bg-green-500"
              : "bg-gradient-to-br from-pink-600 to-purple-700 hover:scale-110"
          } shadow-lg`}
        >
          {added ? (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}