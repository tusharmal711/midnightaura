import ProductCard from "../../components/ProductCard";

const NewArrivals = () => {
  const products = [
    { img: "/images/n1.jpg", title: "Dragon Tee", price: 899 },
    { img: "/images/n2.jpg", title: "Aura Tee", price: 799 },
    { img: "/images/n3.jpg", title: "Skull Art Tee", price: 849 },
    { img: "/images/n4.jpg", title: "Fearless Tee", price: 899 },
  ];

  return (
    <div className="px-6 mt-10 pb-10">
      <h2 className="text-xl font-semibold mb-4">✨ NEW ARRIVALS</h2>

      <div className="grid grid-cols-4 gap-4">
        {products.map((p, i) => (
          <ProductCard key={i} {...p} />
        ))}
      </div>
    </div>
  );
};

export default NewArrivals;