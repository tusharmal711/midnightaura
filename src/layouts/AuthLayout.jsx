import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
function AuthLayout() {
  return (
    <>
      <Navbar />
      <Outlet />   {/* 👈 Page content renders here */}
      <Footer />
    </>
  );
}
export default AuthLayout;