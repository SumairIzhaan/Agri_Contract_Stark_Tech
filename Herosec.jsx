import React from 'react';
import { Link } from 'react-router-dom';
import heroVideo from '../../assets/hero-video.mp4';
import heroOverlay from '../../assets/hero-overlay.png';

const HeroSection = () => {
    // Static guest mode for frontend demo
    const user = null;

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
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
