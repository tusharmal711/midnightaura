import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import tshirt1 from "../assets/images/products/tshirt1.png";
import tshirt2 from "../assets/images/products/tshirt2.png";
import tshirt3 from "../assets/images/products/tshirt3.png";
import tshirt4 from "../assets/images/products/tshirt4.png";
import tshirt5 from "../assets/images/products/tshirt5.png";
import tshirt6 from "../assets/images/products/tshirt6.png";
import tshirt7 from "../assets/images/products/tshirt7.png";
import tshirt8 from "../assets/images/products/tshirt8.png";
import tshirt9 from "../assets/images/products/tshirt9.png";
import tshirt10 from "../assets/images/products/tshirt10.png";
const trendingProducts = [
  { name: "Uchiha Itachi Tee", price: 799, color: "#0d0a0a", graphic: "ウラン" , image : tshirt1},
  { name: "Shadow Hunter Tee", price: 849, color: "#0a0a0d", graphic: "Strals",image : tshirt2 },
  { name: "Moon Aura Tee", price: 749, color: "#08080d", graphic: "○",image : tshirt3 },
  { name: "Tokyo Drift Tee", price: 799, color: "#0d0a08", graphic: "東京" ,image : tshirt4},
  { name: "Dark Street Tee", price: 899, color: "#0a0808", graphic: "市",image : tshirt10 },
];

const newArrivals = [
  { name: "Dragon Soul Tee", price: 849, color: "#0a0a0a", graphic: "竜",image : tshirt6 },
  { name: "Aura Circle Tee", price: 799, color: "#08080d", graphic: "AURA",image : tshirt7 },
  { name: "Skull Wings Tee", price: 899, color: "#0d0808", graphic: "☠",image : tshirt8 },
  { name: "Moonrise Tee", price: 749, color: "#080a0d", graphic: "🌕",image : tshirt9 },
];

export const menProducts = [
  {
    name: "Men Black Tee",
    price: 699,
    
    image: "https://images.unsplash.com/photo-1520975922284-9e0f5c0eaa7a?w=400",
  },
  {
    name: "Casual White Tee",
    price: 599,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400",
  },
  {
    name: "Graphic Street Tee",
    price: 799,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
  },
  {
    name: "Striped Tee",
    price: 749,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
  },
];


// 👗 WOMEN
export const womenProducts = [
  {
    name: "Floral Summer Top",
    price: 699,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
  },
  {
    name: "Casual Crop Tee",
    price: 599,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400",
  },
  {
    name: "Oversized Women Tee",
    price: 799,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400",
  },
  {
    name: "Street Style Top",
    price: 849,
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
  },
];


// 🧒 KIDS
export const kidsProducts = [
  {
    name: "Cartoon Kids Tee",
    price: 399,
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400",
  },
  {
    name: "Superhero Tee",
    price: 499,
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400",
  },
  {
    name: "Cute Panda Tee",
    price: 449,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
  },
  {
    name: "Dino Kids Tee",
    price: 499,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400",
  },
];


// 💎 EARRINGS
export const earringsProducts = [
  {
    name: "Golden Hoop Earrings",
    price: 499,
    image: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba4?w=400",
  },
  {
    name: "Silver Drop Earrings",
    price: 599,
    image: "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=400",
  },
  {
    name: "Pearl Earrings",
    price: 699,
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a2f16?w=400",
  },
  {
    name: "Crystal Earrings",
    price: 899,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
  },
];


// 📿 NECKLACES
export const necklacesProducts = [
  {
    name: "Gold Chain Necklace",
    price: 799,
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400",
  },
  {
    name: "Silver Pendant",
    price: 699,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400",
  },
  {
    name: "Pearl Necklace",
    price: 999,
    image: "https://images.unsplash.com/photo-1617038260897-41a1f14a2f16?w=400",
  },
  {
    name: "Layered Necklace",
    price: 899,
    image: "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=400",
  },
];


// 👕 OVERSIZED
export const oversizedProducts = [
  {
    name: "Oversized Black Tee",
    price: 799,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
  },
  {
    name: "Loose Fit Tee",
    price: 899,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400",
  },
  {
    name: "Drop Shoulder Tee",
    price: 849,
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400",
  },
  {
    name: "Urban Oversized Tee",
    price: 899,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
  },
];


// 🧥 HOODIES
export const hoodiesProducts = [
  {
    name: "Classic Hoodie",
    price: 999,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
  },
  {
    name: "Street Hoodie",
    price: 1199,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
  },
  {
    name: "Minimal Hoodie",
    price: 899,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400",
  },
  {
    name: "Zip Hoodie",
    price: 1099,
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400",
  },
];

export const productSets = {
  "🔥 Trending Now": trendingProducts,
  "✨ New Arrivals": newArrivals,
  "Men": menProducts,
  "Women": womenProducts,
  "Kids": kidsProducts,
  "Earrings": earringsProducts,
  "Necklaces": necklacesProducts,
  "Oversized": oversizedProducts,
  "Hoodies": hoodiesProducts,
};

export default function ProductSection({ title, icon, link }) {
  const navigate = useNavigate();
  const products = productSets[title] || trendingProducts;

  return (
    <div className="px-4 py-5 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        
        <div className="flex items-center gap-2">
          {icon && <span className="text-white">{icon}</span>}

          <h2 className="text-lg font-bold text-white tracking-wide">
            {title}
          </h2>
        </div>

        {/* 🔥 View All Button */}
        <button
          onClick={() => link && navigate(link)}
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
        >
          View All
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {products.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>
    </div>
  );
}