import React, { useState, useEffect } from 'react';

const Fruits = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/crops?season=Fruit`);
            if (!response.ok) throw new Error('Failed to fetch crops');
            const data = await response.json();
            setCrops(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-xl font-medium text-orange-600 animate-pulse">Loading Fruits...</div>;
    if (error) return <div className="text-center py-20 text-red-500 text-lg">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-12 pt-24 min-h-screen bg-orange-50/30">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-orange-800 mb-4 font-serif">Fruits</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        Discover the variety of fruits grown across different regions of India and how to cultivate them.
                    </p>
                </header>

                {crops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {crops.map((crop) => (
                            <div key={crop.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                <div className="h-48 w-full mb-4 overflow-hidden rounded-md bg-gray-100">
                                    <img
                                        src={crop.image ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${crop.image}` : 'https://placehold.co/400x300?text=No+Image'}
                                        alt={crop.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{crop.name}</h2>
                                <p className="text-sm text-orange-600 font-semibold mb-2">{crop.type}</p>
                                <p className="text-gray-600 text-sm mb-4">{crop.description}</p>
                                <div className="text-sm text-gray-500">
                                    <p><span className="font-semibold">Soil:</span> {crop.soil}</p>
                                    <p><span className="font-semibold">Climate:</span> {crop.climate}</p>
                                    <p><span className="font-semibold">Harvest:</span> {crop.harvest}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-gray-400 text-xl font-medium">No fruits found.</div>
                        <p className="text-gray-500 mt-2">Check back later for updates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Fruits;
