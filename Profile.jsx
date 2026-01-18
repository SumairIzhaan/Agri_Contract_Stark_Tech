import React, { useState, useEffect } from 'react'
import { useAuth } from '../Context/AuthContext'
import { User, Mail, Phone, ShieldCheck, MapPin, Tractor, Edit, Save, Upload, History, X, CheckCircle, AlertCircle, Sprout, Calendar, Ruler } from 'lucide-react'
import { supabase } from '../supabaseClient'
import Toast from '../Components/Common/Toast'

// Helper for inputs
const InputField = ({ label, value, onChange, type = "text", placeholder, icon: Icon, isEditing, required = false }) => (
    <div className={`space-y-1 ${!value && isEditing && required ? 'animate-pulse' : ''}`}>
        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
            {Icon && <Icon size={14} className="text-green-600" />} {label} {required && <span className="text-red-500">*</span>}
        </label>

        {isEditing ? (
            <div className="relative">
                <input
                    type={type}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${!value && required ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    placeholder={placeholder}
                />
                {!value && required && <AlertCircle size={14} className="absolute right-3 top-3 text-red-500" />}
            </div>
        ) : (
            <p className={`text-sm font-medium ${!value ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                {value || 'Not provided'}
            </p>
        )}
    </div>
)

const Profile = () => {
    const { user, role } = useAuth()

    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [history, setHistory] = useState([])
    const [toast, setToast] = useState({ message: '', type: '', show: false })
    const [completion, setCompletion] = useState(0)

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        profile_image: null,
        state: '',
        district: '',
        village_city: '',
        pincode: '',
        farming_experience: '',
        crops_grown: '',
        current_season: '',
        expected_yield: '',
        sowing_date: '',
        harvest_date: '',
        land_details: ''
    })

    useEffect(() => {
        if (user) {
            fetchProfile()
            fetchHistory()
        }
    }, [user, role])

    // Calculate completion on data change
    useEffect(() => {
        calculateCompletion()
    }, [profileData])

    const calculateCompletion = () => {
        if (!profileData) return

        let fields = ['name', 'phone', 'state', 'district', 'village_city', 'pincode']
        if (role === 'farmer') {
            fields = [...fields, 'farming_experience', 'crops_grown']
        }

        const filled = fields.filter(field => {
            const val = profileData[field]
            return val && val.toString().trim() !== ''
        })

        const percent = Math.round((filled.length / fields.length) * 100)
        setCompletion(percent)
    }

    const showToast = (message, type = 'success') =>
        setToast({ message, type, show: true })

    const fetchProfile = async () => {
        try {
            setLoading(true)

            if (!user || !user.id) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error

            setProfileData({
                name: data.name || '',
                email: data.email || user.email,
                phone: data.phone || '',
                address: data.address || '',
                profile_image: data.profile_image || null,
                state: data.state || '',
                district: data.district || '',
                village_city: data.village_city || '',
                pincode: data.pincode || '',
                farming_experience: data.farming_experience || '',
                crops_grown: Array.isArray(data.crops_grown) ? data.crops_grown.join(', ') : '',
                current_season: data.current_season || '',
                expected_yield: data.expected_yield || '',
                sowing_date: data.sowing_date || '',
                harvest_date: data.harvest_date || '',
                land_details: data.land_details || ''
            })

        } catch (error) {
            console.error("Error fetching profile:", error)
            // showToast('Profile load failed: ' + error.message, 'error') // Optional: show toast
        } finally {
            setLoading(false)
        }
    }

    const fetchHistory = async () => {
        try {
            let query = supabase.from('crops').select('*').eq('status', 'accepted').order('created_at', { ascending: false });

            if (role === 'farmer') {
                query = query.eq('farmer_id', user.id);
            } else {
                query = query.eq('buyer_id', user.id);
            }

            const { data: cropsData, error } = await query;

            if (error) throw error;

            // Enrich with counterparty details
            const enrichedHistory = await Promise.all(cropsData.map(async (crop) => {
                const counterpartyId = role === 'farmer' ? crop.buyer_id : crop.farmer_id;
                let counterpartyName = 'Unknown';

                if (counterpartyId) {
                    const { data: profile } = await supabase.from('profiles').select('name').eq('id', counterpartyId).single();
                    if (profile) counterpartyName = profile.name;
                }

                return { ...crop, counterpartyName };
            }));

            setHistory(enrichedHistory || []);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setUploading(true)
            const fileName = `${user.id}.${file.name.split('.').pop()}`

            const { error: uploadError } = await supabase.storage.from('profiles').upload(fileName, file, { upsert: true })
            if (uploadError) throw uploadError

            const { data } = supabase.storage.from('profiles').getPublicUrl(fileName)

            const { error: dbError } = await supabase.from('profiles').upsert({
                id: user.id,
                role,
                profile_image: data.publicUrl,
                updated_at: new Date().toISOString()
            })

            if (dbError) throw dbError

            setProfileData(p => ({ ...p, profile_image: data.publicUrl }))
            showToast('Profile image updated')
        } catch (error) {
            console.error("Image upload error:", error)
            showToast(`Upload failed: ${error.message || JSON.stringify(error)}`, 'error')
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateProfile = async () => {
        try {
            // Prepare crops array if farmer
            const crops = profileData.crops_grown && typeof profileData.crops_grown === 'string'
                ? profileData.crops_grown.split(',').map(c => c.trim()).filter(Boolean)
                : [];

            // Helper to handle empty numeric fields as null
            const toInt = (val) => (val === '' || val === null ? null : parseInt(val, 10));

            // Construct specific payload to avoid sending unused state fields that might not be in DB
            const updates = {
                id: user.id,
                name: profileData.name,
                email: profileData.email,
                phone: profileData.phone,
                address: profileData.address,
                state: profileData.state,
                district: profileData.district,
                village_city: profileData.village_city,
                pincode: toInt(profileData.pincode), // Ensure numeric or null
                profile_image: profileData.profile_image,
                role: role,
                updated_at: new Date().toISOString()
            };

            // Add farmer specific fields
            if (role === 'farmer') {
                updates.farming_experience = toInt(profileData.farming_experience);
                updates.land_details = profileData.land_details;
                updates.crops_grown = crops;
            }

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            showToast('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            console.error('Profile update error:', error);
            showToast(`Update failed: ${error.message}`, 'error');
        }
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-green-50/50 pt-28 px-4 pb-12">
            <Toast message={toast.show ? toast.message : ''} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Profile Card & Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-700 h-32 relative">
                            {isEditing && (
                                <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white backdrop-blur-sm transition-all"><X size={20} /></button>
                            )}
                        </div>
                        <div className="px-6 pb-6 relative">
                            <div className="relative -mt-16 mb-4 flex justify-between items-end">
                                <div className="relative group">
                                    {profileData.profile_image && profileData.profile_image.length > 10 ? (
                                        <img
                                            src={profileData.profile_image}
                                            className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-lg bg-white"
                                            alt="Profile"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                                            <User size={64} className="text-white" />
                                        </div>
                                    )}
                                    <label className="absolute bottom-0 right-0 bg-gray-900/80 hover:bg-black text-white p-2 rounded-xl cursor-pointer shadow-lg transition-transform hover:scale-105">
                                        {uploading ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Upload size={16} />}
                                        <input type="file" hidden onChange={handleImageUpload} disabled={uploading} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            <div className="mb-6">
                                {isEditing ? (
                                    <input
                                        value={profileData.name}
                                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                        className="text-2xl font-bold border-b border-gray-300 w-full mb-1 focus:border-green-500 outline-none pb-1"
                                        placeholder="Your Name"
                                    />
                                ) : (
                                    <h1 className="text-2xl font-bold text-gray-900">{profileData.name || 'User Name'}</h1>
                                )}
                                <div className="flex items-center gap-2 text-green-700 font-medium">
                                    <ShieldCheck size={16} />
                                    <span className="capitalize">{role}</span>
                                </div>
                            </div>

                            {/* Profile Completion Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                    <span>Profile Completion</span>
                                    <span className={completion === 100 ? 'text-green-600' : 'text-orange-500'}>{completion}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out ${completion === 100 ? 'bg-green-500' : 'bg-orange-400'}`}
                                        style={{ width: `${completion}%` }}
                                    />
                                </div>
                                {completion < 100 && (
                                    <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                                        <AlertCircle size={12} /> Complete profile to enable crop selling
                                    </p>
                                )}
                            </div>

                            {isEditing ? (
                                <button
                                    onClick={handleUpdateProfile}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Save Changes
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full bg-white text-green-700 border-2 border-green-100 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit size={18} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-green-100 p-2 rounded-lg text-green-600"><Phone size={18} /></span> Contact Info
                        </h3>
                        <div className="space-y-4">
                            <InputField label="Email Address" value={profileData.email} icon={Mail} isEditing={isEditing} onChange={(val) => setProfileData({ ...profileData, email: val })} />
                            <InputField label="Phone Number" value={profileData.phone} icon={Phone} isEditing={isEditing} required onChange={(val) => setProfileData({ ...profileData, phone: val })} />
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & History */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Location & Farm Details */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-green-50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-green-100 p-3 rounded-xl text-green-700">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Location & Details</h2>
                                <p className="text-sm text-gray-500">Your address and farming specifics</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="State" value={profileData.state} icon={MapPin} isEditing={isEditing} required onChange={(val) => setProfileData({ ...profileData, state: val })} />
                            <InputField label="District" value={profileData.district} icon={MapPin} isEditing={isEditing} required onChange={(val) => setProfileData({ ...profileData, district: val })} />
                            <InputField label="Village / City" value={profileData.village_city} icon={MapPin} isEditing={isEditing} required onChange={(val) => setProfileData({ ...profileData, village_city: val })} />
                            <InputField label="Pincode" value={profileData.pincode} icon={MapPin} isEditing={isEditing} required type="number" onChange={(val) => setProfileData({ ...profileData, pincode: val })} />
                            <div className="md:col-span-2">
                                <InputField label="Full Address" value={profileData.address} icon={MapPin} isEditing={isEditing} onChange={(val) => setProfileData({ ...profileData, address: val })} />
                            </div>
                        </div>
                    </div>

                    {/* Farmer Specific Details */}
                    {role === 'farmer' && (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-green-50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-green-100 p-3 rounded-xl text-green-700">
                                    <Tractor size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Farming Profile</h2>
                                    <p className="text-sm text-gray-500">Experience and crop details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Experience (Years)" value={profileData.farming_experience} icon={Calendar} isEditing={isEditing} required type="number" onChange={(val) => setProfileData({ ...profileData, farming_experience: val })} />
                                <InputField label="Land Size / Details" value={profileData.land_details} icon={Ruler} isEditing={isEditing} onChange={(val) => setProfileData({ ...profileData, land_details: val })} />
                                <div className="md:col-span-2">
                                    <InputField label="Crops Grown (comma separated)" value={profileData.crops_grown} icon={Sprout} isEditing={isEditing} placeholder="e.g. Wheat, Rice, Cotton" required onChange={(val) => setProfileData({ ...profileData, crops_grown: val })} />
                                </div>
                            </div>
                        </div>
                    )}



                    {/* Transaction History (For both Farmer and Buyer) */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <History className="text-green-600" /> Transaction History
                        </h3>

                        {history.length === 0 ? (
                            <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100 border-dashed">
                                <Sprout size={32} className="mx-auto text-green-300 mb-2" />
                                <p className="text-gray-500 font-medium">No completed transactions yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map(h => (
                                    <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                                <CheckCircle size={18} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">{h.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {role === 'farmer' ? `Sold to: ${h.counterpartyName}` : `Bought from: ${h.counterpartyName}`}
                                                </p>
                                                <p className="text-xs text-gray-400">{new Date(h.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-700">₹{h.price}</p>
                                            <p className="text-xs text-gray-500">{h.quantity} {h.unit}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
