import React from 'react';
import BhumiSahayak from '../Components/Chatbot/BhumiSahayak';

const Community = () => {
    return (
        <div className="pt-24 pb-12 px-4 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Farmer Community & Support</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Connect with other farmers, get expert advice, and solve your queries instantly with our AI assistant.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Left Side: General Info / Placeholder Content */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-green-800 mb-4">Latest Discussions</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="font-semibold text-gray-800">Best time to sow Wheat (Rabi)?</p>
                                    <p className="text-sm text-gray-500 mt-1">Started by Ram Lal • 2 hours ago</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="font-semibold text-gray-800">Organic fertilizer recommendations</p>
                                    <p className="text-sm text-gray-500 mt-1">Started by Sita Devi • 5 hours ago</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="font-semibold text-gray-800">Mandi price fluctuation negotiation</p>
                                    <p className="text-sm text-gray-500 mt-1">Started by Rajesh Kumar • 1 day ago</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                            <h3 className="text-xl font-bold text-green-800 mb-2">Did You Know?</h3>
                            <p className="text-green-700">
                                You can now digitally sign contracts directly from your mobile phone without any physical paperwork. Ask our AI assistant for details!
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Chatbot */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Ask BhumiSahayak (AI)</h3>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Online</span>
                        </div>
                        <BhumiSahayak />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Community;
