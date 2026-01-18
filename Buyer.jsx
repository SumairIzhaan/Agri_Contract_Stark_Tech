import React from 'react';

const Buyer = () => {
    return (
        <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
                <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Buyer Dashboard</h1>
                <p className="text-xl text-gray-600">Welcome, Buyer! Explore crops and initiate contracts here.</p>
                <div className="pt-8">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Browse Listings</button>
                </div>
            </div>
        </div>
    );
};

export default Buyer;
