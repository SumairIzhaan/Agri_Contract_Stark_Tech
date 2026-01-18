import React from 'react';
import { Target, Eye } from 'lucide-react';

const AboutSection = () => {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
                        Our <span className="text-green-600">Mission</span> & <span className="text-green-600">Vision</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Dedicated to empowering the Indian farmer with technology and knowledge.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    {/* Mission Box */}
                    <div className="bg-green-50 rounded-3xl p-10 border border-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
                        <div className="bg-green-600 p-4 rounded-full text-white mb-6 shadow-md">
                            <Target size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Aim</h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            To build a secure digital contract farming platform that directly connects farmers and buyers, ensures fair price discovery, guarantees timely payments, and eliminates dependency on middlemen.
                        </p>
                    </div>

                    {/* Vision Box */}
                    <div className="bg-blue-50 rounded-3xl p-10 border border-blue-100 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center text-center">
                        <div className="bg-blue-600 p-4 rounded-full text-white mb-6 shadow-md">
                            <Eye size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
                        <p className="text-gray-700 leading-relaxed text-lg">
                            To empower farmers by creating a transparent, fair, and digital agricultural marketplace where trust replaces middlemen and every farmer receives the right price on time.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
