import ProductCard from "../../components/ProductCard";

const necklacesProducts = [
  {
    name: "Golden Chain Necklace",
    price: 799,
    color: "#d4af37",
    graphic: "Gold",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400",
  },
  {
    name: "Silver Pendant Necklace",
    price: 699,
    color: "#e0e0e0",
    graphic: "Pendant",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
  },
  {
    name: "Pearl Classic Necklace",
    price: 999,
    color: "#f8f8f8",
    graphic: "Pearl",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a2f16?w=400",
  },
  {
    name: "Layered Fashion Necklace",
    price: 899,
    color: "#ffffff",
    graphic: "Layer",
    image: "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=400",
  },
  {
    name: "Minimal Bar Necklace",
    price: 649,
    color: "#cccccc",
    graphic: "Minimal",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
  },
  {
    name: "Diamond Style Necklace",
    price: 1299,
    color: "#eeeeee",
    graphic: "Diamond",
    image: "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?w=400",
  },
  {
    name: "Heart Pendant Necklace",
    price: 749,
    color: "#ff4081",
    graphic: "Heart",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
  },
  {
    name: "Ethnic Choker Necklace",
    price: 1199,
    color: "#b8860b",
    graphic: "Choker",
    image: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba4?w=400",
  },
  {
    name: "Crystal Shine Necklace",
    price: 1099,
    color: "#ffffff",
    graphic: "Crystal",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a2f16?w=400",
  },
  {
    name: "Boho Style Necklace",
    price: 849,
    color: "#a1887f",
    graphic: "Boho",
    image: "https://images.unsplash.com/photo-1520975922284-9e0f5c0eaa7a?w=400",
  },
];

const Necklaces = () => {
  return (
    <div className="px-4 py-6 max-w-screen-xl mx-auto">

      {/* Heading */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">
         Necklaces Collection
        </h2>

        
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {necklacesProducts.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>

    </div>
  );
};

export default Necklaces;