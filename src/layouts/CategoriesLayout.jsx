import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Categories from "../components/Categories";
import { Outlet } from "react-router-dom";

function CategoriesLayout() {
  return (
    <>
      
      <Outlet />     
     
    </>
  );
}
export default CategoriesLayout;