import ProductCard from "../../components/ProductCard";

const Trending = () => {
  const products = [
    { img: "/images/t1.jpg", title: "Uchiha Itachi Tee", price: 799 },
    { img: "/images/t2.jpg", title: "Shadow Hunter Tee", price: 849 },
    { img: "/images/t3.jpg", title: "Moon Aura Tee", price: 749 },
    { img: "/images/t4.jpg", title: "Tokyo Drift Tee", price: 799 },
  ];

  return (
    <div className="px-6 mt-10">
      <h2 className="text-xl font-semibold mb-4">🔥 TRENDING NOW</h2>

      <div className="grid grid-cols-4 gap-4">
        {products.map((p, i) => (
          <ProductCard key={i} {...p} />
        ))}
      </div>
    </div>
  );
};

export default Trending;