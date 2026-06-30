import Navbar from "../components/Navbar";
import Categories from "../components/Categories";
import HeroSection from "../sections/home/HeroSection";
import Features from "../sections/home/Features";
import ProductSection from "../components/ProductSection";
import SpinnerDiscount from "../components/SpinnerDiscount";
import { Helmet } from "react-helmet-async";

export default function UserDashboard() {
  return (
    <>
  <Helmet>
    <title>Dashboard | ChomokTomok</title>

    <meta
      name="description"
      content="Your ChomokTomok dashboard. Browse products, manage your account, orders, cart and wishlist."
    />

    <meta name="robots" content="noindex,nofollow" />

    <link
      rel="canonical"
      href="https://chomoktomok.com/user/dashboard/"
    />
  </Helmet>
    <div className="bg-[#0E1320] text-white min-h-screen">


      <HeroSection />
      <Features />
      <SpinnerDiscount />
 <ProductSection title="🔥 Trending Now" link="/user/dashboard/categories/trending" />
<ProductSection title="✨ New Arrivals" link="/user/dashboard/categories/new-arrivals" />
<ProductSection title="Men" link="/user/dashboard/categories/men" />
<ProductSection title="Women" link="/user/dashboard/categories/women" />
<ProductSection title="Kids" link="/user/dashboard/categories/kids" />
<ProductSection title="Earrings" link="/user/dashboard/categories/earrings" />
<ProductSection title="Necklaces" link="/user/dashboard/categories/necklaces" />
<ProductSection title="Oversized" link="/user/dashboard/categories/oversized" />
<ProductSection title="Hoodies" link="/user/dashboard/categories/hoodies" />

    </div>
    </>
  );
}