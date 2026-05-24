import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import  AuthLayout from "./layouts/AuthLayout";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UserDashboardLayout from "./layouts/UserDashboardLayout";
import UserDashboard from "./pages/UserDashboard";
import ProfileLayout from "./pages/UserProfile/ProfileLayout";
import ProfileDetails from "./pages/UserProfile/ProfileDetails";
import Order from "./pages/UserProfile/Order";
import Cart from "./pages/UserProfile/Cart";
import Categories from "./components/Categories";
import AdminPanelLayout from "./pages/AdminPanel/AdminPanelLayout";
import AdminDashboard from "./pages/AdminPanel/AdminDashboard";
import ListingProducts from "./pages/AdminPanel/ListingProducts";
import AdminOrder from "./pages/AdminPanel/AdminOrder";
import Feedback from "./pages/AdminPanel/FeedBack";
import Women from "./pages/Categories/Women";
import CategoryLayout from "./components/Categories";
import Earrings from "./pages/Categories/Earrings";
import Hoodies from "./pages/Categories/Hoodies";
import Kids from "./pages/Categories/Kids";
import Necklaces from "./pages/Categories/Necklaces";
import Oversized from "./pages/Categories/Oversized";
import Men from "./pages/Categories/Men";
import UserCategories from "./components/UserCategories";
import UserDashboardProfileLayout from "./layouts/UserDashboardProfileLayout";
import ScrollToTop from "./components/ScrollToTop";
import ProductView from "./pages/ProductDetails/ProductView";
// import Dashboard from "./pages/Dashboard";
import Cookies from "js-cookie";
import ViewCheckout from "./pages/ProductDetails/ViewCheckout";
import ViewPayment from "./pages/ProductDetails/ViewPayment";

function App() {
  function ConditionalProductViewLayout() {
  const isLoggedIn = !!Cookies.get("user");
  return isLoggedIn ? <UserDashboardLayout /> : <MainLayout />;
}
  return (
    <BrowserRouter>
    <ScrollToTop />  
      <Routes>

       
        {/* home page routing is starting from here */}
        <Route element={<MainLayout />}>
        <Route path="/" element={<Categories />}>
         <Route index element={<Home />} />
         <Route path="categories/women" element={<Women />} />
          <Route path="categories/earrings" element={<Earrings />} />
          <Route path="categories/hoodies" element={<Hoodies />} />
          <Route path="categories/kids" element={<Kids />} />
          <Route path="categories/necklaces" element={<Necklaces />} />
           <Route path="categories/oversized" element={<Oversized />} />
            <Route path="categories/men" element={<Men />} />

       </Route>
      </Route>






        {/* auth page (login , registration) routing is starting here */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        
        </Route>




      {/* user dashboard routing is starting from here */}
       <Route element={<UserDashboardLayout />}>

         <Route path="/user/dashboard" element={<UserCategories />}>
         <Route index element={<UserDashboard />} />
         <Route path="categories/women" element={<Women />} />
          <Route path="categories/earrings" element={<Earrings />} />
          <Route path="categories/hoodies" element={<Hoodies />} />
          <Route path="categories/kids" element={<Kids />} />
          <Route path="categories/necklaces" element={<Necklaces />} />
           <Route path="categories/oversized" element={<Oversized />} />
            <Route path="categories/men" element={<Men />} />
       </Route>




          
         {/* profile section */}
         <Route element={<UserDashboardProfileLayout />}>
         
          <Route path="/user/profile" element={<ProfileLayout />}>
          <Route index element={<ProfileDetails />} />
          <Route path="orders" element={<Order />} />
          <Route path="cart" element={<Cart />} />
          </Route>
          </Route>
          
        
        </Route>

        {/* user dashboard routing is ending here */}




        {/* product view is starting from here */}
         <Route element={<ConditionalProductViewLayout  />}>
          <Route path="/product-view/:productId" element={<ProductView />} />
          <Route path="/view-checkout/:productId" element={<ViewCheckout />} />
           <Route path="/view-payment/:productId" element={<ViewPayment />} />
         
         </Route>
         {/* product view is ending here */}





      
       {/* admin panel routing is starting here */}
       <Route path="/admin" element={<AdminPanelLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="listing" element={<ListingProducts />} />
          <Route path="orders" element={<AdminOrder />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
       {/* admin panel routing is ending here */}

       
       





      </Routes>
    </BrowserRouter>
  );
}

export default App;