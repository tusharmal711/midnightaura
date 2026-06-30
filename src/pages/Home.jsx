import Navbar from "../components/Navbar";
import Categories from "../components/Categories";
import HeroSection from "../sections/home/HeroSection";
import Features from "../sections/home/Features";
import ProductSection from "../components/ProductSection";
import { Helmet } from "react-helmet-async";
import SpinnerDiscount from "../components/SpinnerDiscount";


export default function Home() {
  return (
    <>
     <Helmet>
        <title>
          ChomokTomok | Buy Custom T-Shirts, Oversized T-Shirts & Hoodies Online
        </title>

        <meta
          name="description"
          content="Shop premium custom T-shirts, oversized T-shirts, hoodies, ladies tops, kids wear, earrings and necklaces at ChomokTomok. Pure cotton, premium quality and affordable prices."
        />

        <meta
          name="keywords"
          content="custom t-shirts, oversized t-shirts, hoodies, printed t-shirts, ladies tops, kids wear, earrings, necklaces, fashion store, ChomokTomok"
        />

        <meta name="robots" content="index,follow" />

        <link
          rel="canonical"
          href="https://chomoktomok.com/"
        />

        <meta
          property="og:title"
          content="ChomokTomok | Buy Custom T-Shirts, Oversized T-Shirts & Hoodies Online"
        />

        <meta
          property="og:description"
          content="Shop premium custom T-shirts, oversized T-shirts, hoodies, ladies tops, kids wear, earrings and necklaces at ChomokTomok."
        />

        <meta
          property="og:image"
          content="https://chomoktomok.com/Images/chomoktomok-og.png"
        />

        <meta
          property="og:url"
          content="https://chomoktomok.com/"
        />

        <meta property="og:type" content="website" />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="ChomokTomok | Buy Custom T-Shirts, Oversized T-Shirts & Hoodies Online"
        />

        <meta
          name="twitter:description"
          content="Buy premium custom T-shirts, hoodies, oversized T-shirts and fashion accessories online from ChomokTomok."
        />

        <meta
          name="twitter:image"
          content="https://chomoktomok.com/Images/chomoktomok-og.png"
        />
      </Helmet>
   
    <div className="bg-[#0E1320] text-white min-h-screen">
      
     
      <HeroSection />
      <Features />
      <SpinnerDiscount />
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
     </>
  );
}