import ProductCard from "../../components/ProductCard";

const hoodiesProducts = [
  {
    name: "Classic Black Hoodie",
    price: 999,
    color: "#111111",
    graphic: "Classic",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
  },
  {
    name: "Oversized Street Hoodie",
    price: 1199,
    color: "#1a1a1a",
    graphic: "Street",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
  },
  {
    name: "Minimal Grey Hoodie",
    price: 899,
    color: "#cccccc",
    graphic: "Minimal",
    image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=400",
  },
  {
    name: "Printed Graphic Hoodie",
    price: 1299,
    color: "#222222",
    graphic: "Graphic",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
  },
  {
    name: "Zip-Up Casual Hoodie",
    price: 1099,
    color: "#2a2a2a",
    graphic: "Zip",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
  },
  {
    name: "Winter Fleece Hoodie",
    price: 1399,
    color: "#333333",
    graphic: "Fleece",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400",
  },
  {
    name: "Urban Style Hoodie",
    price: 1199,
    color: "#1c1c1c",
    graphic: "Urban",
    image: "https://images.unsplash.com/photo-1520975922284-9e0f5c0eaa7a?w=400",
  },
  {
    name: "Sport Fit Hoodie",
    price: 999,
    color: "#2d2d2d",
    graphic: "Sport",
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400",
  },
  {
    name: "Anime Print Hoodie",
    price: 1299,
    color: "#000000",
    graphic: "Anime",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
  },
  {
    name: "Color Block Hoodie",
    price: 1099,
    color: "#444444",
    graphic: "Block",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
  },
];

const Hoodies = () => {
  return (
    <div className="px-4 py-6 max-w-screen-xl mx-auto">

      {/* Heading */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Hoodies Collection
        </h2>

      
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {hoodiesProducts.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>

    </div>
  );
};

export default Hoodies;