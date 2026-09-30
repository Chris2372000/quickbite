import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Menu from "./pages/Menu";
import RestaurantDiscovery from "./pages/RestaurantDiscovery";
import RestaurantDetails from "./pages/RestaurantDetails";
import Cart from "./pages/Cart";
import CheckoutAddress from "./pages/checkout/CheckoutAddress";
import CheckoutPayment from "./pages/checkout/CheckoutPayment";
import CheckoutReview from "./pages/checkout/CheckoutReview";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import SavedAddresses from "./pages/SavedAddresses";
import PaymentMethods from "./pages/PaymentMethods";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import RestaurantPortal from "./pages/RestaurantPortal";
import Offers from "./pages/Offers";

export default function App() {
  const location = useLocation();
  const restaurantMode = location.pathname.startsWith("/restaurant/");
  return <>{!restaurantMode && <Navbar/>}<Routes>
    <Route path="/" element={<Landing/>}/><Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/>
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    <Route path="/menu" element={<Menu/>}/><Route path="/restaurants" element={<RestaurantDiscovery/>}/><Route path="/restaurants/:id" element={<RestaurantDetails/>}/>
    <Route path="/cart" element={<Cart/>}/>
    <Route path="/offers" element={<Offers/>}/>
    <Route path="/checkout" element={<Navigate to="/checkout/address" replace/>}/>
    <Route path="/checkout/address" element={<CheckoutAddress/>}/>
    <Route path="/checkout/payment" element={<CheckoutPayment/>}/>
    <Route path="/checkout/review" element={<CheckoutReview/>}/>
    <Route path="/order-confirmation/:id" element={<OrderConfirmation/>}/>
    <Route path="/orders" element={<OrderHistory/>}/><Route path="/orders/:id" element={<OrderTracking/>}/><Route path="/profile" element={<Profile/>}/>
    <Route path="/favorites" element={<Favorites/>}/><Route path="/addresses" element={<SavedAddresses/>}/><Route path="/payment-methods" element={<PaymentMethods/>}/>
    <Route path="/notifications" element={<Notifications/>}/><Route path="/settings" element={<Settings/>}/><Route path="/admin/*" element={<AdminDashboard/>}/>
    <Route path="/restaurant/*" element={<RestaurantPortal/>}/>
  </Routes></>;
}
