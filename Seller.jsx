import React from 'react';

const Seller = () => {
    return (
        <div className="pt-24 min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="text-center space-y-4">
                <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Seller Dashboard</h1>
                <p className="text-xl text-gray-600">Welcome, Farmer! Manage your crops and contracts here.</p>
                <div className="pt-8">
                    <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Add New Crop</button>
                </div>
            </div>
        </div>
    );
};

export default Seller;
