import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import NetworkStatus from "../pages/NetworkStatus";
function AuthLayout() {
  return (
    <>
    <NetworkStatus/>
      <Navbar />
      <Outlet />   {/* 👈 Page content renders here */}
      <Footer />
    </>
  );
}
export default AuthLayout;