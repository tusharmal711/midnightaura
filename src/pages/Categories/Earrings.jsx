import ProductCard from "../../components/ProductCard";

const earringsProducts = [
  {
    name: "Golden Hoop Earrings",
    price: 499,
    color: "#f5e6c8",
    graphic: "Hoop",
    image: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba4?w=400",
  },
  {
    name: "Silver Drop Earrings",
    price: 599,
    color: "#e0e0e0",
    graphic: "Drop",
    image: "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=400",
  },
  {
    name: "Pearl Stud Earrings",
    price: 699,
    color: "#f8f8f8",
    graphic: "Pearl",
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a2f16?w=400",
  },
  {
    name: "Crystal Designer Earrings",
    price: 899,
    color: "#ffffff",
    graphic: "Crystal",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
  },
  {
    name: "Ethnic Jhumka Earrings",
    price: 749,
    color: "#d4af37",
    graphic: "Jhumka",
    image: "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?w=400",
  },
  {
    name: "Minimalist Chain Earrings",
    price: 549,
    color: "#cccccc",
    graphic: "Chain",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
  },
];

const Earrings = () => {
  return (
    <div className="px-4 py-6 max-w-screen-xl mx-auto">

      {/* Heading */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Earrings Collection
        </h2>

        
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {earringsProducts.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>

    </div>
  );
};

export default Earrings;