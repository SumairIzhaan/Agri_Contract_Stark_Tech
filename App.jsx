import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './Components/Footer/Footer';
import Home from './pages/Home';
import Seller from './pages/Seller';
import Buyer from './pages/Buyer';
import FarmerInfo from './Components/FarmerInfo/Farmer';
import About from './Components/About/About';

import  from './pages/Login';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/seller" element={<Seller />} />
            <Route path="/buyer" element={<Buyer />} />
            <Route path="/farmer-info" element={<FarmerInfo />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
