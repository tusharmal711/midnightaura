import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import Categories from "../components/Categories";
import UserCategories from "../components/UserCategories";
function UserDashboardProfileLayout() {
  return (
    <>
      <UserCategories />
    </>
  );
}
export default UserDashboardProfileLayout;