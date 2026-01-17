import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { User, Upload, Leaf, MapPin, Calendar, DollarSign, Package, Eye } from 'lucide-react';
import Toast from '../Components/Common/Toast';
import { supabase } from '../supabaseClient';
import { downloadContract } from '../services/contractService';
import { FileText } from 'lucide-react';

const SellerDashboard = () => {
    const { user, role } = useAuth();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '', show: false });
    const [myCrops, setMyCrops] = useState([]);

    // Placeholder data - in a real app, fetch from profile
    const farmerName = user?.user_metadata?.name || "Farmer Name";
    const farmerRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Seller";

    const [formData, setFormData] = useState({
        cropName: '',
        cropType: '',
        quantity: '',
        unit: 'kg',
        expectedPrice: '',
        harvestDate: '',
        location: '',
        image: null
    });

    const cropTypes = [
        "Apple", "Arecanut", "Bajra", "Banana", "Barley", "Beans", "Bitter Gourd",
        "Bottle Gourd", "Brinjal", "Cabbage", "Capsicum", "Cardamom", "Carrot",
        "Cauliflower", "Chilli", "Coconut", "Coffee", "Coriander", "Cotton",
        "Cucumber", "Cumin", "Custard Apple", "Flowers (General)", "Garlic",
        "Ginger", "Gram (Chana)", "Grapes", "Groundnut", "Guava", "Hibiscus",
        "Jasmine", "Jowar", "Maize", "Mango", "Marigold", "Masoor", "Moong",
        "Muskmelon", "Mustard", "Okra (Bhindi)", "Onion", "Orange", "Papaya",
        "Peas", "Pineapple", "Pomegranate", "Potato", "Pumpkin", "Radish",
        "Ragi", "Rice", "Rose", "Rubber", "Sapota (Chiku)", "Soybean", "Spinach",
        "Sugarcane", "Sunflower", "Tea", "Tomato", "Tur (Arhar)", "Turmeric",
        "Urad", "Watermelon", "Wheat", "Other"
    ];
    const units = ["kg", "quintal", "ton", "crates"];

    const showToast = (message, type = 'success') => {
        setToast({ message, type, show: true });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) throw new Error("You must be logged in to post a crop.");

            let publicUrl = null;

            // 1. Upload Image if exists
            if (formData.image) {
                const file = formData.image;
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('crops')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('crops')
                    .getPublicUrl(fileName);

                publicUrl = data.publicUrl;
            }

            // 2. Construct crop data object with proper types
            const cropData = {
                farmer_id: user.id,
                name: formData.cropName,
                type: formData.cropType,
                quantity: parseFloat(formData.quantity) || 0, // Ensure number
                unit: formData.unit,
                price: parseFloat(formData.expectedPrice) || 0, // Ensure number
                harvest_date: formData.harvestDate ? formData.harvestDate : null,
                location: formData.location ? formData.location : null,
                image_url: publicUrl,
                status: 'pending'
            };

            const { error } = await supabase.from('crops').insert([cropData]);

            if (error) {
                console.error("Supabase Insert Error:", JSON.stringify(error, null, 2)); // Detailed log
                throw error;
            }

            showToast('Crop listed successfully!', 'success');

            // Reset form
            setFormData({
                cropName: '',
                cropType: '',
                quantity: '',
                unit: 'kg',
                expectedPrice: '',
                harvestDate: '',
                location: '',
                image: null
            });

        } catch (error) {
            console.error('Error posting crop:', error);
            showToast(error.message || 'Failed to list crop', 'error');
        } finally {
            setLoading(false);
        }
    };

    // ... (previous imports)
    // ... (previous imports)
    const [isProfileComplete, setIsProfileComplete] = useState(true);

    // Fetch crops on mount and check profile
    React.useEffect(() => {
        if (user) {
            fetchMyCrops();
            checkProfileCompleteness();
        }
    }, [user]);

    const checkProfileCompleteness = async () => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                // Define required fields
                const required = ['name', 'phone', 'state', 'district', 'village_city', 'pincode', 'farming_experience'];
                const missing = required.filter(field => !data[field] || data[field].toString().trim() === '');

                // Check if crops_grown has at least one entry (it's an array or string depending on version, logic handles string split in Profile but let's check basic existence)
                const hasCrops = data.crops_grown && data.crops_grown.length > 0;

                if (missing.length > 0 || !hasCrops) {
                    setIsProfileComplete(false);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchMyCrops = async () => {
        try {
            const { data, error } = await supabase
                .from('crops')
                .select('*')
                .eq('farmer_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMyCrops(data || []);
        } catch (error) {
            console.error("Error fetching crops:", error);
        }
    };

    const handleDownloadContract = async (crop) => {
        try {
            if (!crop.buyer_id) {
                showToast('No buyer found for this crop', 'error');
                return;
            }

            setLoading(true);

            // Fetch Buyer Details
            const { data: buyerData, error: buyerError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', crop.buyer_id)
                .single();

            if (buyerError || !buyerData) throw new Error("Failed to fetch buyer details");

            // Construct payload matching backend expectation
            const contractDetails = {
                farmer: {
                    name: user?.user_metadata?.name || 'Farmer',
                    phone: user?.phone || 'N/A',
                    village: user?.user_metadata?.village_city || '', // Assuming these might return null if not in metadata, ideally fetch full profile
                    district: user?.user_metadata?.district || '',
                    state: user?.user_metadata?.state || ''
                },
                buyer: {
                    name: buyerData.name || 'Buyer',
                    phone: buyerData.phone || 'N/A',
                    village: buyerData.village_city || '',
                    district: buyerData.district || '',
                    state: buyerData.state || ''
                },
                crop: {
                    name: crop.name
                },
                deal: {
                    contractId: `CNT-${Date.now()}`,
                    quantity: crop.quantity,
                    pricePerQuintal: crop.price,
                    totalAmount: crop.quantity * crop.price,
                    deliveryDate: 'Within 7 days',
                    deliveryLocation: 'Farm Gate'
                }
            };

            await downloadContract(contractDetails);
            showToast('Contract downloaded successfully!', 'success');
        } catch (error) {
            console.error('Download error:', error);
            showToast('Failed to download contract', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isProfileComplete) {
        return (
            <div className="min-h-screen bg-green-50 pt-24 pb-12 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-2 border-red-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Incomplete</h2>
                    <p className="text-gray-500 mb-6">
                        To maintain quality and trust, you must complete your farmer profile before selling crops.
                    </p>
                    <a href="/profile" className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors">
                        Complete Profile Now
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-green-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {/* ... (rest of the dashboard) */}
            <Toast
                message={toast.show ? toast.message : ''}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />
            {/* ... */}

            <div className="max-w-4xl mx-auto space-y-8">

                {/* 1. Heading Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-green-900">Seller Dashboard</h1>
                    <p className="text-green-700 mt-2">Manage your listings and contracts.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Post Crop Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100 sticky top-24">
                            <div className="bg-green-600 px-6 py-4">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Leaf className="text-green-200" />
                                    Post New Crop
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Compact Form Fields */}
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Crop Name</label>
                                    <input type="text" name="cropName" value={formData.cropName} onChange={handleInputChange} className="w-full p-2 border rounded-lg" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                    <select name="cropType" value={formData.cropType} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white" required>
                                        <option value="" disabled>Select</option>
                                        {cropTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Qty</label>
                                        <input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full p-2 border rounded-lg" required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Unit</label>
                                        <select name="unit" value={formData.unit} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white">
                                            {units.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Price (₹)</label>
                                    <input type="number" name="expectedPrice" value={formData.expectedPrice} onChange={handleInputChange} className="w-full p-2 border rounded-lg" required />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Crop Image</label>
                                    <div className="border rounded-lg p-2 bg-white flex items-center gap-2 mt-1">
                                        <Upload size={20} className="text-gray-400" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    onClick={() => console.log("Post button clicked", formData)}
                                    className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Posting...' : 'Post Crop'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: My Listings */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">My Listings</h2>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">{myCrops.length} Crops</span>
                        </div>

                        {myCrops.length === 0 ? (
                            <div className="bg-white p-8 rounded-2xl text-center text-gray-500">
                                <Leaf className="mx-auto text-gray-300 mb-2" size={48} />
                                <p>No crops listed yet. Use the form to add one!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {myCrops.map(crop => (
                                    <div key={crop.id} className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex flex-col sm:flex-row items-center gap-6 transition-transform hover:scale-[1.01]">
                                        <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                            {crop.image_url ? (
                                                <img src={crop.image_url} alt={crop.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><Leaf /></div>
                                            )}
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{crop.name}</h3>
                                                {crop.buyer_id ? (
                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Sold</span>
                                                ) : (
                                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                                <div className="flex items-center gap-1"><Package size={14} /> {crop.quantity} {crop.unit}</div>
                                                <div className="flex items-center gap-1"><DollarSign size={14} /> ₹{crop.price}/{crop.unit}</div>
                                                <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(crop.created_at).toLocaleDateString()}</div>
                                            </div>

                                            {crop.buyer_id && (
                                                <button
                                                    onClick={() => handleDownloadContract(crop)}
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors border border-green-200 font-semibold text-sm"
                                                >
                                                    <FileText size={16} /> Download Contract
                                                </button>
                                            )}
                                            {crop.image_url && (
                                                <a
                                                    href={crop.image_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 font-semibold text-sm"
                                                >
                                                    <Eye size={16} /> View Image
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
