import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import NetworkStatus from "../pages/NetworkStatus";
import InfoNavbar from "../components/InfoNavbar";
function InfoLayout() {
  return (
    <>
    <NetworkStatus/>
      <InfoNavbar/>
      <Outlet />   {/* 👈 Page content renders here */}
      <Footer />
    </>
  );
}
export default InfoLayout;