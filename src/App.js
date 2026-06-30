import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
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
import Cookies from "js-cookie";
import ViewCheckout from "./pages/ProductDetails/ViewCheckout";
import ViewPayment from "./pages/ProductDetails/ViewPayment";
import OrderSuccess from "./pages/ProductDetails/OrderSuccess";
import OrderDetail from "./pages/AdminPanel/OrderDetails";
import DeliveryBoyLayout from "./pages/DeliveryBoyPanel/DeliveryBoyPanelLayout";
import DeliveryDashboard from "./pages/DeliveryBoyPanel/DeliveyDahboard";
import ReceivedDeliveries from "./pages/DeliveryBoyPanel/ReceivedDeliveryProduct";
import DeliveryProductDetails from "./pages/DeliveryBoyPanel/DeliveryProductDetails";
import NewArrivals from "./pages/Categories/NewArrivals";
import NotFound from "./pages/NotFound";
import NetworkStatus from "./pages/NetworkStatus";
import CustomizeProduct from "./pages/Categories/CustomizeProduct";
import AboutUs from "./pages/FooterCompanyPages/AboutUs";
import ContactUs from "./pages/FooterCompanyPages/ContactUs";
import InfoLayout from "./layouts/InfoLayout";
import PrivacyPolicy from "./pages/FooterCompanyPages/PrivacyPolicy";
import TermsAndConditions from "./pages/FooterCompanyPages/TermsConditions";
import ReturnPolicy from "./pages/FooterCompanyPages/ReturnPolicy";
import ViewCartCheckout from "./pages/CartItem/ViewCartCheckOut";
import ViewCartPayment from "./pages/CartItem/ViewCartPayment";
import CartOrderDetail from "./pages/AdminPanel/CartOrderDetails";
import CartDeliveryProductDetails from "./pages/DeliveryBoyPanel/Cartdeliveryproductdetails";
import Trending from "./pages/Categories/Trending";

// ── Guards ────────────────────────────────────────────────────────────────────

/**
 * Redirects logged-in users away from the guest home to their dashboard.
 */
function PublicOnlyRoute({ children }) {
  const isLoggedIn = !!Cookies.get("user");
  return isLoggedIn ? <Navigate to="/user/dashboard" replace /> : children;
}

/**
 * Blocks unauthenticated users and sends them to /login.
 */
function PrivateRoute({ children }) {
  const isLoggedIn = !!Cookies.get("user");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

/**
 * Picks the right layout for product / checkout views.
 */
function ConditionalProductViewLayout() {
  const isLoggedIn = !!Cookies.get("user");
  return isLoggedIn ? <UserDashboardLayout /> : <MainLayout />;
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
    
      <Routes>

        {/* ── Public / Guest routes ───────────────────────────────────────── */}
        <Route
          element={
            <PublicOnlyRoute>
              <MainLayout />
            </PublicOnlyRoute>
          }
        >
          <Route path="/" element={<Categories />}>
            <Route index element={<Home />} />
            <Route path="categories/women"        element={<Women />} />
            <Route path="categories/earrings"     element={<Earrings />} />
            <Route path="categories/hoodies"      element={<Hoodies />} />
            <Route path="categories/kids"         element={<Kids />} />
            <Route path="categories/necklaces"    element={<Necklaces />} />
            <Route path="categories/oversized"    element={<Oversized />} />
            <Route path="categories/men"          element={<Men />} />
            <Route path="categories/new-arrivals" element={<NewArrivals />} />
             <Route path="categories/trending" element={<Trending />} />
            <Route path="categories/customize" element={<CustomizeProduct />} />
          </Route>
        </Route>

        {/* ── Auth routes ─────────────────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>




                 {/* common pages  */}
         
        <Route element={<InfoLayout />}>
  <Route path="/about" element={<AboutUs />} />
  <Route path="/contact" element={<ContactUs />} />
  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
  <Route path="/return-policy" element={<ReturnPolicy />} />
</Route>











        {/* ── Protected: User Dashboard ───────────────────────────────────── */}
        <Route
          element={
            <PrivateRoute>
              <UserDashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="/user/dashboard" element={<UserCategories />}>
            <Route index element={<UserDashboard />} />
            <Route path="categories/women"        element={<Women />} />
            <Route path="categories/earrings"     element={<Earrings />} />
            <Route path="categories/hoodies"      element={<Hoodies />} />
            <Route path="categories/kids"         element={<Kids />} />
            <Route path="categories/necklaces"    element={<Necklaces />} />
            <Route path="categories/oversized"    element={<Oversized />} />
            <Route path="categories/men"          element={<Men />} />
            <Route path="categories/new-arrivals" element={<NewArrivals />} />
            <Route path="categories/trending" element={<Trending />} />
            <Route path="categories/customize" element={<CustomizeProduct />} />
          </Route>

          <Route element={<UserDashboardProfileLayout />}>
            <Route path="/user/profile" element={<ProfileLayout />}>
              <Route index element={<ProfileDetails />} />
              <Route path="orders" element={<Order />} />
              <Route path="cart"   element={<Cart />} />
            </Route>
          </Route>
        </Route>

        {/* ── Product / Checkout views ─────────────────────────────────────── */}
        <Route element={<ConditionalProductViewLayout />}>
          <Route path="/product-view/:productId"  element={<ProductView />} />
          <Route path="/view-checkout/:productId" element={<ViewCheckout />} />
          <Route path="/view-payment/:productId"  element={<ViewPayment />} />




         
         <Route path="/cart-checkout"  element={<ViewCartCheckout />} />
         <Route path="/cart-payment"  element={<ViewCartPayment />} />


        </Route>
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* ── Admin panel ─────────────────────────────────────────────────── */}
        <Route path="/admin" element={<AdminPanelLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="listing"         element={<ListingProducts />} />
          <Route path="orders"          element={<AdminOrder />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="cart-orders/:cartOrderId" element={<CartOrderDetail />} />
          <Route path="feedback"        element={<Feedback />} />
        </Route>

        {/* ── Delivery boy panel ──────────────────────────────────────────── */}
        <Route path="/delivery-boy" element={<DeliveryBoyLayout />}>
          <Route index element={<DeliveryDashboard />} />
          <Route path="deliveries"          element={<ReceivedDeliveries />} />
          <Route path="deliveries/:orderId" element={<DeliveryProductDetails />} />
         <Route path="cart-deliveries/:cartOrderId" element={<CartDeliveryProductDetails />} />

        </Route>






  






        {/* ── 404 catch-all ───────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;