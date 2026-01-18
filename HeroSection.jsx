import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthContext';
// Ensure this path is correct or update it if the image location changes
import heroOverlay from '../../../assets/hero-overlay.png';
// Assuming the video URL is external, or you can download it to assets

import heroVideo from '../../../assets/hero-video.mp4';

const HeroSection = () => {
    const { user, role } = useAuth();
    return (
        <section className="relative h-screen w-full overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0">
                <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline

                >
                    <source src={heroVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4">
                <img
                    src={heroOverlay}
                    alt="Farmer Icon"
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-green-500 shadow-lg mb-6 object-cover animate-fade-in-down"
                />
                <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-down drop-shadow-lg">
                    Cultivating Prosperity
                    <span className="block text-green-400 mt-2 text-2xl md:text-4xl">Technology for the Modern Farmer</span>
                </h1>
                <p className="text-lg md:text-2xl mb-10 max-w-3xl animate-fade-in-up drop-shadow-md text-gray-200">
                    Get real-time insights, expert advice, and market trends to revolutionize your farming.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up">
                    <Link
                        to="/community"
                        className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-bold py-4 px-10 rounded-full transition duration-300 transform hover:scale-105 shadow-xl border border-white/30"
                    >
                        Join Community
                    </Link>

                    {/* Guest: Login Button */}
                    {!user && (
                        <Link
                            to="/login/farmer"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full transition duration-300 transform hover:scale-105 shadow-xl border border-transparent hover:border-green-400"
                        >
                            Login
                        </Link>
                    )}

                    {/* Farmer: Sell Crop Button */}
                    {user && role === 'farmer' && (
                        <Link
                            to="/seller"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full transition duration-300 transform hover:scale-105 shadow-xl border border-transparent hover:border-green-400"
                        >
                            Sell Crop
                        </Link>
                    )}

                    {/* Buyer: Buy Crops Button */}
                    {user && role === 'buyer' && (
                        <Link
                            to="/buyer"
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-10 rounded-full transition duration-300 transform hover:scale-105 shadow-xl border border-transparent hover:border-green-400"
                        >
                            Buy Crops
                        </Link>
                    )}
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-white/70">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </div>
        </section>
    );
};

export default HeroSection;
