import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Categories from "../components/Categories";
import HeroSection from "../sections/home/HeroSection";
import Features from "../sections/home/Features";
import ProductSection from "../components/ProductSection";

const sectionVariants = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0 },
};

const products = [
  { title: "🔥 Trending Now", link: "/categories/trending" },
  { title: "✨ New Arrivals", link: "/categories/new-arrivals" },
  { title: "Men", link: "/categories/men" },
  { title: "Women", link: "/categories/women" },
  { title: "Kids", link: "/categories/kids" },
  { title: "Earrings", link: "/categories/earrings" },
  { title: "Necklaces", link: "/categories/necklaces" },
  { title: "Oversized", link: "/categories/oversized" },
  { title: "Hoodies", link: "/categories/hoodies" },
];

export default function Home() {
  return (
    <div className="bg-[#0E1320] text-white min-h-screen">
      <HeroSection />
      <Features />

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