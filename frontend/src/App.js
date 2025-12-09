import React, { useState, useEffect } from "react";
import "./Styles/App.css";
import Footer from "./components/footer";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./pages/home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Services from "./pages/Services";
import ProdutsDetails from "./pages/ProdutsDetails";
import ProductsFilter from "./pages/ProductsFilter";
import Cart from "./pages/cart";
import Setting from "./pages/SettingUser";
import Shipping from "./pages/Shipinglocation";
import Orderstatus from "./pages/Orderstatus";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import CheckoutPage from "./pages/CheckoutPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminDashboard from "./pages/AdminPage/AdminDashboard";
import AdminRegister from "./pages/AdminPage/AdminRegister";
import AdminLogin from "./pages/AdminPage/AdminLogin";
import AdminManageProducts from "./pages/AdminPage/AdminProducts";
import AdminManageOrders from "./pages/AdminPage/AdminOrders";
import AdminManageCustomrs from "./pages/AdminPage/AdminCustomers";
import AdminPromotions from "./pages/AdminPage/AdminPromotions";
import AdminTeam from "./pages/AdminPage/AdminTeam";
import AdminFinance from "./pages/AdminPage/AdminFinance";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("isAdmin") === "true");
  
  // FIX: Initialize userData with address as an empty array
  const [userData, setUserData] = useState({
    fname: "",
    lname: "",
    userId: "",
    address: [], 
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const shouldShowNavbar = !window.location.pathname.toLowerCase().startsWith('/admin');
  const shouldShowFooter = !window.location.pathname.toLowerCase().startsWith('/admin');

  useEffect(() => {
    const fetchAdminDetails = async () => {
      const Atoken = localStorage.getItem("AToken");
      if (!Atoken) {
        setIsAdmin(false);
        return;
      }
      try {
        const response = await fetch("http://localhost:3001/admin", {
          method: "GET",
          headers: { Authorization: `Bearer ${Atoken}` },
        });

        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        if (data.success) {
          setAdminData(data); // FIX: Use the whole data object, not data.admin
          setIsAdmin(true);
          localStorage.setItem("isAdmin", "true");
        } else {
          setIsAdmin(false);
          localStorage.removeItem("isAdmin");
        }
      } catch (error) {
        console.error("Error fetching admin details:", error);
        setIsAdmin(false);
        localStorage.removeItem("isAdmin");
      }
    };
    fetchAdminDetails();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("http://localhost:3001/user", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!response.ok) throw new Error("Failed to fetch user details");

          const data = await response.json();
          if (data.success) {
            setUserData({
              userId: data.userId,
              email: data.email,
              fname: data.fname,
              lname: data.lname,
              address: data.address || [], // Ensure address is always an array
            });
            setIsLoggedIn(true);
          } else {
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          setIsLoggedIn(false);
        }
      }
    };
    fetchUserDetails();
  }, [isLoggedIn]); // Add isLoggedIn as dependency to refetch when login state changes

  useEffect(() => {
    const fetchSelectedProducts = async () => {
      if (userData.userId) {
        try {
          const response = await fetch(`http://localhost:3001/cart/${userData.userId}`);
          if (!response.ok) throw new Error("Failed to fetch selected products");
          const data = await response.json();
          // The backend now sends populated product data
          setSelectedProducts(data.selectedProducts || []);
        } catch (error) {
          console.error("Error fetching selected products:", error);
        }
      }
    };

    fetchSelectedProducts();
  }, [userData.userId]);

  return (
    <Router>
      {shouldShowNavbar && (
        <Navbar
          isLoggedIn={isLoggedIn}
          userData={userData}
          selectedProducts={selectedProducts}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
        />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/SettingUser" element={<Setting userData={userData} />} />
        <Route path="/ShippingLocations" element={<Shipping userData={userData} userId={userData.userId} />} />
        <Route path="/Orderstatus" element={<Orderstatus userData={userData} userId={userData.userId} />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/products" element={<Products />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkoutPage" element={<CheckoutPage userId={userData.userId} selectedProducts={selectedProducts} />} />
        <Route path="/product/:id" element={<ProdutsDetails userId={userData.userId} userData={userData} />} />
        <Route path="/products/:category" element={<ProductsFilter userId={userData.userId} />} />
        <Route path="/products/:category/:subcategory" element={<ProductsFilter userId={userData.userId} />} />
        <Route
          path="/cart"
          element={
            <Cart
              userId={userData.userId}
              userData={userData}
              selectedProducts={selectedProducts}
              setSelectedProducts={setSelectedProducts}
            />
          }
        />
        <Route path="/login" element={!isLoggedIn ? <Login setIsLoggedIn={setIsLoggedIn} setUserData={setUserData} /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/" replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-login" element={<AdminLogin setIsAdmin={setIsAdmin} setAdminData={setAdminData} />} />
        <Route path="/admin" element={<Navigate to="/admindashboard" replace />} />
        <Route path="/admindashboard" element={<ProtectedRoute isAdmin={isAdmin}><AdminDashboard adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminmanageproducts" element={<ProtectedRoute isAdmin={isAdmin}><AdminManageProducts adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminmanageorders" element={<ProtectedRoute isAdmin={isAdmin}><AdminManageOrders adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminmanagecustomrs" element={<ProtectedRoute isAdmin={isAdmin}><AdminManageCustomrs adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminpromotions" element={<ProtectedRoute isAdmin={isAdmin}><AdminPromotions adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminteam" element={<ProtectedRoute isAdmin={isAdmin}><AdminTeam adminData={adminData} /></ProtectedRoute>} />
        <Route path="/adminfinance" element={<ProtectedRoute isAdmin={isAdmin}><AdminFinance adminData={adminData} /></ProtectedRoute>} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </Router>
  );
}