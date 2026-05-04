import ProductCard from "../../components/ProductCard";

const menProducts = [
  {
    name: "Classic Black Men's Tee",
    price: 699,
    color: "#111111",
    graphic: "Classic",
    image: "https://images.unsplash.com/photo-1520975922284-9e0f5c0eaa7a?w=400",
  },
  {
    name: "Casual White T-shirt",
    price: 599,
    color: "#ffffff",
    graphic: "Casual",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400",
  },
  {
    name: "Graphic Print Men's Tee",
    price: 799,
    color: "#222222",
    graphic: "Graphic",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
  },
  {
    name: "Striped Summer T-shirt",
    price: 749,
    color: "#f0f0f0",
    graphic: "Stripes",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
  },
  {
    name: "Street Style T-shirt",
    price: 849,
    color: "#1a1a1a",
    graphic: "Street",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400",
  },
  {
    name: "Minimal Grey T-shirt",
    price: 649,
    color: "#cccccc",
    graphic: "Minimal",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
  },
  {
    name: "Sports Fit T-shirt",
    price: 799,
    color: "#2d2d2d",
    graphic: "Sport",
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400",
  },
  {
    name: "Vintage Wash T-shirt",
    price: 899,
    color: "#333333",
    graphic: "Vintage",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
  },
  {
    name: "Anime Print Men's Tee",
    price: 899,
    color: "#000000",
    graphic: "Anime",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
  },
  {
    name: "Urban Fit T-shirt",
    price: 749,
    color: "#1c1c1c",
    graphic: "Urban",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400",
  },
];

const Men = () => {
  return (
    <div className="px-4 py-6 max-w-screen-xl mx-auto">

      {/* Heading */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Men's Collection
        </h2>

      
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {menProducts.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>

    </div>
  );
};

export default Men;