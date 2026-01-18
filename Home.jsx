import React from 'react';
import Hero from '../Components/Herosection/Herosec';
import About from '../Components/About/About';
import Farmer from '../Components/FarmerInfo/Farmer';

const Home = () => {
    return (
        <div className="min-h-screen bg-white">
            <Hero />
            <About />
            <Farmer />
            {/* Additional sections for Home can be added here */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">We provide a seamless platform for farmers and buyers to connect directly, ensuring fair prices.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
