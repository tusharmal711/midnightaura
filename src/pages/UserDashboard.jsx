import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Categories from "../components/Categories";
import HeroSection from "../sections/home/HeroSection";
import Features from "../sections/home/Features";
import ProductSection from "../components/ProductSection";
import SpinnerDiscount from "../components/SpinnerDiscount";

const sectionVariants = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0 },
};

const products = [
  { title: "🔥 Trending Now", link: "/user/dashboard/categories/trending" },
  { title: "✨ New Arrivals", link: "/user/dashboard/categories/new-arrivals" },
  { title: "Men", link: "/user/dashboard/categories/men" },
  { title: "Women", link: "/user/dashboard/categories/women" },
  { title: "Kids", link: "/user/dashboard/categories/kids" },
  { title: "Earrings", link: "/user/dashboard/categories/earrings" },
  { title: "Necklaces", link: "/user/dashboard/categories/necklaces" },
  { title: "Oversized", link: "/user/dashboard/categories/oversized" },
  { title: "Hoodies", link: "/user/dashboard/categories/hoodies" },
];

export default function UserDashboard() {
  return (
    <div className="bg-[#0E1320] text-white min-h-screen">
      <HeroSection />
      <Features />
      <SpinnerDiscount />

      {products.map((p) => (
        <motion.div
          key={p.title}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <ProductSection title={p.title} link={p.link} />
        </motion.div>
      ))}
    </div>
  );
}