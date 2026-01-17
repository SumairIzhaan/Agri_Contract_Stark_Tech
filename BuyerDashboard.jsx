import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Ensure this path is correct
import { useAuth } from '../Context/AuthContext';
import { MapPin, Calendar, CheckCircle, XCircle, User, Loader2, Package, DollarSign, Leaf, Eye, LogOut } from 'lucide-react';
import Toast from '../Components/Common/Toast';

const BuyerDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/', { replace: true });
    };
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // ID of crop being acted upon
    const [toast, setToast] = useState({ message: '', type: '', show: false });

    const showToast = (message, type = 'success') => {
        setToast({ message, type, show: true });
    };

    const fetchCrops = async () => {
        try {
            setLoading(true);
            // Fetch crops with 'pending' status
            // Also fetching farmer details via join if possible, or we fetch farmers separately
            // For now, let's fetch crops and manually fetch farmers or assume table relation is set

            // Attempt simple join if foreign key exists and is named 'farmers'
            // const { data, error } = await supabase.from('crops').select('*, farmers(name, phone)').eq('status', 'pending');

            // Fallback: Fetch crops first
            const { data: cropsData, error: cropsError } = await supabase
                .from('crops')
                .select('*')
                .eq('status', 'pending') // Only show pending requests
                .order('created_at', { ascending: false });

            if (cropsError) throw cropsError;

            // Enrich with farmer names manually to be safe
            const enrichedCrops = await Promise.all(cropsData.map(async (crop) => {
                const { data: farmerData } = await supabase
                    .from('profiles')
                    .select('name, phone')
                    .eq('id', crop.farmer_id)
                    .single();

                return {
                    ...crop,
                    farmerName: farmerData?.name || 'Unknown Farmer',
                    farmerPhone: farmerData?.phone,
                };
            }));

            // Filter client-side for 'pending' if column might be missing initially to avoid crash
            const pendingCrops = enrichedCrops.filter(c => !c.status || c.status === 'pending');
            setCrops(pendingCrops);

        } catch (error) {
            console.error("Error fetching crops:", error);
            showToast('Failed to load crop requests', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrops();
    }, []);

    const [selectedImage, setSelectedImage] = useState(null);

    const handleAction = async (cropId, action) => {
        try {
            setActionLoading(cropId);
            const status = action === 'accept' ? 'accepted' : 'rejected';

            // 1. Update status in Supabase
            // If accepting, also set the buyer_id
            const updatePayload = { status: status };
            if (action === 'accept') {
                updatePayload.buyer_id = user.id;
            }

            const { error } = await supabase
                .from('crops')
                .update(updatePayload)
                .eq('id', cropId);

            if (error) throw error;

            // 2. If Accepted, Send Notification to Farmer
            if (action === 'accept') {
                // Find the crop to get farmer_id
                const crop = crops.find(c => c.id === cropId);
                if (crop) {
                    await supabase.from('notifications').insert([{
                        user_id: crop.farmer_id,
                        type: 'ORDER_ACCEPTED',
                        message: `Buyer ${user.user_metadata?.name || 'Unknown'} accepted your request for ${crop.name}!`,
                        data: {
                            buyerName: user.user_metadata?.name || 'Valued Buyer',
                            buyerPhone: user.user_metadata?.phone || user.phone || 'N/A', // Assuming phone is in metadata or top level
                            buyerLocation: user.user_metadata?.location || 'Location Hidden',
                            cropName: crop.name,
                            price: crop.price,
                            cropId: crop.id,
                            buyerId: user.id // Added for deep linking
                        }
                    }]);
                }
            }

            showToast(action === 'accept' ? 'Deal Accepted!' : 'Offer Rejected', action === 'accept' ? 'success' : 'info');

            // Remove from local list
            setCrops(prev => prev.filter(c => c.id !== cropId));

        } catch (error) {
            console.error(`Error ${action}ing deal:`, error);
            showToast(`Failed to ${action} deal`, 'error');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50/50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <Toast
                message={toast.show ? toast.message : ''}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
                    <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
                        <button
                            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                            onClick={() => setSelectedImage(null)}
                        >
                            <XCircle size={32} />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Crop Full View"
                            className="w-full h-full object-contain rounded-lg shadow-2xl bg-white"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center relative">
                    <button
                        onClick={handleLogout}
                        className="absolute right-0 top-0 bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-red-100 transition-colors"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                    <h1 className="text-3xl font-bold text-green-900">Marketplace Requests</h1>
                    <p className="text-green-700 mt-2">View and respond to crop selling offers from farmers.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-green-600" size={40} />
                    </div>
                ) : crops.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-orange-100">
                        <Leaf className="mx-auto h-12 w-12 text-green-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Pending Requests</h3>
                        <p className="text-gray-500">New crop offers will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {crops.map((crop) => (
                            <div key={crop.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">

                                {/* 🔹 Crop Details Section */}
                                <div className="p-6 pb-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mb-2 uppercase tracking-wide">
                                                {crop.type}
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight">{crop.name}</h3>
                                        </div>
                                        {/* Crop Image Placeholder or Real Image */}
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative group cursor-pointer" onClick={() => crop.image_url && setSelectedImage(crop.image_url)}>
                                            {crop.image_url ? (
                                                <>
                                                    <img src={crop.image_url} alt={crop.name} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Eye size={20} className="text-white drop-shadow-md" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                                    <Package size={24} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-700 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Package size={16} className="text-green-600" />
                                            <span className="font-semibold">{crop.quantity} {crop.unit}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <DollarSign size={16} className="text-green-600" />
                                            <span className="font-semibold">₹{crop.price}/{crop.unit}</span>
                                        </div>
                                        <div className="flex items-center gap-2 col-span-2">
                                            <Calendar size={16} className="text-green-600" />
                                            <span>Harvest: {crop.harvest_date || 'Not specified'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-100 mx-6"></div>

                                {/* 🔹 Farmer Details Section */}
                                <div className="p-6 pt-4 flex-grow">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{crop.farmerName}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <MapPin size={12} />
                                                <span>{crop.location || 'Unknown Location'}</span>
                                            </div>
                                        </div>
                                        {/* Contact Indicator */}
                                        <div className="ml-auto" title="Verified Farmer">
                                            <CheckCircle size={18} className="text-blue-500" fill="white" />
                                        </div>
                                    </div>
                                </div>

                                {/* 🔹 Action Section */}
                                <div className="p-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAction(crop.id, 'reject')}
                                        disabled={actionLoading === crop.id}
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors font-medium text-sm disabled:opacity-50"
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(crop.id, 'accept')}
                                        disabled={actionLoading === crop.id}
                                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700 shadow-md transition-all active:scale-95 font-medium text-sm disabled:opacity-50"
                                    >
                                        {actionLoading === crop.id ? <Loader2 className="animate-spin" size={18} /> : (
                                            <>
                                                <CheckCircle size={18} />
                                                Accept Deal
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerDashboard;
