import ProductCard from "../../components/ProductCard";

const kidsProducts = [
  {
    name: "Cartoon Print Kids Tee",
    price: 399,
    color: "#ffeb3b",
    graphic: "Cartoon",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400",
  },
  {
    name: "Superhero Kids T-shirt",
    price: 499,
    color: "#2196f3",
    graphic: "Hero",
    image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400",
  },
  {
    name: "Cute Panda Kids Tee",
    price: 449,
    color: "#ffffff",
    graphic: "Panda",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
  },
  {
    name: "Dinosaur Print T-shirt",
    price: 499,
    color: "#4caf50",
    graphic: "Dino",
    image: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400",
  },
  {
    name: "Rainbow Kids Tee",
    price: 399,
    color: "#ff4081",
    graphic: "Rainbow",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400",
  },
  {
    name: "Minimal Kids Casual Tee",
    price: 349,
    color: "#eeeeee",
    graphic: "Casual",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
  },
  {
    name: "Animal Print Kids Tee",
    price: 449,
    color: "#795548",
    graphic: "Animal",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400",
  },
  {
    name: "Space Theme Kids Tee",
    price: 499,
    color: "#3f51b5",
    graphic: "Space",
    image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400",
  },
  {
    name: "Emoji Print Kids Tee",
    price: 399,
    color: "#ffc107",
    graphic: "Emoji",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
  },
  {
    name: "Sports Kids T-shirt",
    price: 449,
    color: "#009688",
    graphic: "Sport",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400",
  },
];

const Kids = () => {
  return (
    <div className="px-4 py-6 max-w-screen-xl mx-auto">

      {/* Heading */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Kids Collection
        </h2>

       
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {kidsProducts.map((p, i) => (
          <ProductCard key={i} product={p} />
        ))}
      </div>

    </div>
  );
};

export default Kids;