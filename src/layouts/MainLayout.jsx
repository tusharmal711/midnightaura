import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import Categories from "../components/Categories";
function MainLayout() {
  return (
    <>
      <Navbar />
      
      <Outlet />   {/* 👈 Page content renders here */}
      <Footer />
    </>
  );
}
export default MainLayout;