import Navbar from "../components/Navbar";
import Categories from "../components/Categories";
import HeroSection from "../sections/home/HeroSection";
import Features from "../sections/home/Features";
import ProductSection from "../components/ProductSection";



export default function Home() {
  return (
    <div className="bg-[#0E1320] text-white min-h-screen">
      
     
      <HeroSection />
      <Features />
      <ProductSection title="🔥 Trending Now" link="/categories/trending" />
<ProductSection title="✨ New Arrivals" link="/categories/new-arrivals" />
<ProductSection title="Men" link="/categories/men" />
<ProductSection title="Women" link="/categories/women" />
<ProductSection title="Kids" link="/categories/kids" />
<ProductSection title="Earrings" link="/categories/earrings" />
<ProductSection title="Necklaces" link="/categories/necklaces" />
<ProductSection title="Oversized" link="/categories/oversized" />
<ProductSection title="Hoodies" link="/categories/hoodies" />
   
    </div>
  );
}