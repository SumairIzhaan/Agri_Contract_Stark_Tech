import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};


import ProtectedRoute from './Components/Common/ProtectedRoute';
import { AuthProvider } from './Context/AuthContext';
import FarmerLogin from './Pages/FarmerLogin';
import BuyerLogin from './Pages/BuyerLogin';
import Navbar from './Components/Home/Navbar/Navbar';
import HeroSection from './Components/Home/HeroSection/HeroSection';
import FarmerInfo from './Components/Home/FarmerInfo/FarmerInfo';
import Footer from './Components/Footer/Footer';

import InfoSection from './Components/Home/AboutSection/InfoSection';

import SellerDashboard from './Pages/SellerDashboard';

import BuyerDashboard from './Pages/BuyerDashboard';
import Profile from './Pages/Profile';
import OrderDetails from './Pages/OrderDetails';

// Placeholder components for routes

const Mandi = () => <div className="pt-32 p-8 text-center text-3xl">Mandi Bhav Page Coming Soon</div>;
const Community = () => <div className="pt-32 p-8 text-center text-3xl">Community Page Coming Soon</div>;

import Kharif from './Components/Crops/Kharif';
import Rabi from './Components/Crops/Rabi';
import Vegetables from './Components/Crops/Vegetables';
import Fruits from './Components/Crops/Fruits';
import Flowers from './Components/Crops/Flowers';



const Home = () => (
  <main className="min-h-screen bg-white">
    <HeroSection />
    <InfoSection />
    <FarmerInfo />
  </main>
);

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mandi" element={<Mandi />} />
            <Route path="/crops/kharif" element={<Kharif />} />
            <Route path="/crops/rabi" element={<Rabi />} />
            <Route path="/crops/vegetables" element={<Vegetables />} />
            <Route path="/crops/fruits" element={<Fruits />} />
            <Route path="/crops/flowers" element={<Flowers />} />
            <Route path="/community" element={<Community />} />
            <Route
              path="/seller"
              element={
                <ProtectedRoute allowedRoles={['farmer']}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyer"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/order-details" element={<OrderDetails />} />

            {/* New Clean Farmer Auth Routes - Using Combined Component */}
            <Route path="/login/farmer" element={<FarmerLogin />} />
            <Route path="/signup/farmer" element={<FarmerLogin />} />

            {/* New Clean Buyer Auth Routes */}
            <Route path="/login/buyer" element={<BuyerLogin />} />
            <Route path="/signup/buyer" element={<BuyerLogin />} />

            {/* Add more routes here */}
          </Routes>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
