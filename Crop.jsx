import React, { useState, useEffect } from 'react';

const Crop = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('All');

    const categories = ['All', 'Kharif', 'Rabi', 'Vegetable', 'Fruit', 'Flower'];

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/crops`);
            if (!response.ok) {
                throw new Error('Failed to fetch crops');
            }
            const data = await response.json();
            setCrops(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const filteredCrops = activeTab === 'All'
        ? crops
        : crops.filter(crop => crop.season === activeTab || crop.type === activeTab);

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-green-700">Crop Encyclopedia</h1>

            {/* Category Tabs */}
            <div className="flex flex-wrapjustify-center mb-8 gap-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveTab(category)}
                        className={`px-4 py-2 rounded-full font-medium transition-colors ${activeTab === category
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-green-50'
                            }`}
                    >
                        {category === 'Kharif' || category === 'Rabi' ? `${category} Crops` : category === 'All' ? 'All Crops' : `${category}s`}
                    </button>
                ))}
            </div>

            {/* Crops Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCrops.map((crop) => (
                    <div key={crop.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <div className="h-48 overflow-hidden">
                            <img
                                src={crop.image ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${crop.image}` : ''}
                                alt={crop.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-bold text-gray-800">{crop.name}</h2>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                                    {crop.season}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{crop.description}</p>

                            <div className="space-y-1 text-sm">
                                <p><span className="font-semibold text-gray-700">Type:</span> {crop.type}</p>
                                <p><span className="font-semibold text-gray-700">Scientific Name:</span> <span className="italic">{crop.scientificName}</span></p>
                                <p><span className="font-semibold text-gray-700">Soil:</span> {crop.soil}</p>
                                <p><span className="font-semibold text-gray-700">Duration:</span> {crop.duration}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCrops.length === 0 && (
                <div className="text-center text-gray-500 py-10">
                    No crops found for this category.
                </div>
            )}
        </div>
    );
};

export default Crop;
