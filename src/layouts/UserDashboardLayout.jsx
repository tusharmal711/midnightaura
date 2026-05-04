import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import Categories from "../components/Categories";
function UserDashboardLayout() {
  return (
    <>
      <UserNavbar />
    
      <Outlet />   {/* 👈 Page content renders here */}
      <Footer />
    </>
  );
}
export default UserDashboardLayout;