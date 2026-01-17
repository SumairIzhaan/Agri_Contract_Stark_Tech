import React from 'react';
import { Sprout, TrendingUp, Users, CloudRain } from 'lucide-react';

const FarmerInfo = () => {
    const features = [
        {
            icon: <Sprout size={48} className="text-green-500" />,
            title: "Smart Crop Insights",
            description: "Get detailed recommendations on what to plant, when to sow, and how to maximize yield based on your soil type."
        },
        {
            icon: <TrendingUp size={48} className="text-blue-500" />,
            title: "Market Trends",
            description: "Stay ahead with real-time market prices (Mandi Bhav) and demand forecasts to sell your produce at the best rates."
        },
        {
            icon: <CloudRain size={48} className="text-cyan-500" />,
            title: "Weather Alerts",
            description: "Receive timely weather updates and alerts to protect your crops from unseasonal rains and extreme conditions."
        },
        {
            icon: <Users size={48} className="text-orange-500" />,
            title: "Community Expert Support",
            description: "Connect with fellow farmers and agri-experts to solve problems, share knowledge, and grow together."
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
                        Everything You Need to <span className="text-green-600">Grow Better</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Empowering farmers with cutting-edge technology and localized data.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-b-4 border-transparent hover:border-green-500 group"
                        >
                            <div className="mb-6 bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-3 text-center group-hover:text-green-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-center leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="mt-20 bg-green-600 rounded-3xl p-10 md:p-16 text-white text-center shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-green-500 rounded-full opacity-50 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-green-700 rounded-full opacity-50 blur-3xl"></div>

                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">10k+</div>
                            <div className="text-green-100 font-medium">Farmers Joined</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                            <div className="text-green-100 font-medium">Expert Advisors</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">25+</div>
                            <div className="text-green-100 font-medium">Crops Covered</div>
                        </div>
                        <div>
                            <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
                            <div className="text-green-100 font-medium">Free Access</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FarmerInfo;
