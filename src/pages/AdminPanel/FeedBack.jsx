// Feedback.jsx
import { useState } from "react";

const dummyReviews = [
  {
    id: 1,
    user: "Rahul Sharma",
    product: "Oversized Hoodie",
    rating: 5,
    comment: "Amazing quality! Loved the fabric 🔥",
    date: "2026-05-01",
  },
  {
    id: 2,
    user: "Priya Singh",
    product: "Graphic T-shirt",
    rating: 4,
    comment: "Print is good but delivery was late.",
    date: "2026-05-02",
  },
  {
    id: 3,
    user: "Amit Das",
    product: "Oversized Hoodie",
    rating: 3,
    comment: "Size was slightly bigger than expected.",
    date: "2026-05-03",
  },
];

export default function Feedback() {
  const [selectedProduct, setSelectedProduct] = useState("All");
  const [search, setSearch] = useState("");

  const products = ["All", ...new Set(dummyReviews.map(r => r.product))];

  const filteredReviews = dummyReviews.filter((r) => {
    return (
      (selectedProduct === "All" || r.product === selectedProduct) &&
      (r.user.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: "linear-gradient(135deg, #0E1320 0%, #1a1a24 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white">Customer Feedback</h2>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-[#1a1a24] border border-white/10 text-white px-3 py-2 rounded-lg"
            >
              {products.map((p, i) => (
                <option key={i}>{p}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search review..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1a1a24] border border-white/10 text-white px-3 py-2 rounded-lg"
            />
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="p-5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* User */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-semibold">{review.user}</h3>
                <span className="text-xs text-white/40">{review.date}</span>
              </div>

              {/* Product */}
              <p className="text-sm text-purple-400 mb-2">{review.product}</p>

              {/* Rating */}
              <div className="flex mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < review.rating ? "text-yellow-400" : "text-white/20"}>
                    ★
                  </span>
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm text-white/70">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <p className="text-center text-white/50 mt-10">No reviews found</p>
        )}
      </div>
    </div>
  );
}