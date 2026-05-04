import ProductCard from "../../components/ProductCard";
import tshirt7 from "../../assets/images/products/tshirt7.png";
import tshirt8 from "../../assets/images/products/tshirt8.png";
import tshirt9 from "../../assets/images/products/tshirt9.png";
import tshirt10 from "../../assets/images/products/tshirt10.png";
const womenProducts = [
  {
    name: "Floral Summer Top",
    price: 699,
    color: "#f5e6e8",
    graphic: "Floral",
    image: tshirt7,
  },
  {
    name: "Casual Crop Tee",
    price: 599,
    color: "#f0f0f0",
    graphic: "Crop",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
  },
  {
    name: "Oversized Women Tee",
    price: 799,
    color: "#e8e8f0",
    graphic: "Oversize",
    image: tshirt10,
  },
  {
    name: "Striped Casual Top",
    price: 749,
    color: "#ffffff",
    graphic: "Stripes",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
  },
  {
    name: "Street Style Tee",
    price: 849,
    color: "#dcdcdc",
    graphic: "Street",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  },
  {
    name: "Elegant Black Top",
    price: 899,
    color: "#111111",
    graphic: "Elegant",
    image: tshirt8,
  },
];

const Women = () => {
  return (
    <div className="px-4 py-6 max-w-screen-xl mx-auto">

      {/* Heading */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Women Collection
        </h2>

        
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {womenProducts.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>

    </div>
  );
};

export default Women;