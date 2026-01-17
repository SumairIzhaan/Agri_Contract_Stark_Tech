import React, { useState, useEffect } from 'react'
import { useAuth } from '../Context/AuthContext'
import { supabase } from '../supabaseClient'
import Toast from '../Components/Common/Toast'
import {
    User, Mail, Phone, ShieldCheck, MapPin, Tractor, Edit, Save, Upload,
    History, X, CheckCircle, AlertCircle, Sprout, Calendar, Ruler
} from 'lucide-react'

// Reusable Input Field
const InputField = ({ label, value, onChange, type = 'text', placeholder, icon: Icon, isEditing, required = false }) => (
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
                    placeholder={placeholder}
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all ${!value && required ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
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
        name: '', email: '', phone: '', address: '', profile_image: null,
        state: '', district: '', village_city: '', pincode: '',
        farming_experience: '', crops_grown: '', current_season: '',
        expected_yield: '', sowing_date: '', harvest_date: '', land_details: ''
    })

    // Fetch profile and history
    useEffect(() => {
        if (!user) return
        const fetchData = async () => {
            await fetchProfile()
            if (role === 'farmer') await fetchHistory()
        }
        fetchData()
    }, [user, role])

    // Calculate completion
    useEffect(() => { calculateCompletion() }, [profileData])

    const showToast = (message, type = 'success') => setToast({ message, type, show: true })

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
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
        } catch {
            showToast('Profile load failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    const fetchHistory = async () => {
        const { data } = await supabase.from('crops').select('*').eq('farmer_id', user.id).order('created_at', { ascending: false })
        setHistory(data || [])
    }

    const calculateCompletion = () => {
        const fields = ['name', 'phone', 'state', 'district', 'village_city', 'pincode']
        const requiredFields = role === 'farmer' ? [...fields, 'farming_experience', 'crops_grown'] : fields
        const filled = requiredFields.filter(f => profileData[f] && profileData[f].toString().trim() !== '')
        setCompletion(Math.round((filled.length / requiredFields.length) * 100))
    }

    const handleUpdateProfile = async () => {
        try {
            const crops = role === 'farmer' ? profileData.crops_grown.split(',').map(c => c.trim()).filter(Boolean) : null

            // Explicitly specify fields to update (exclude email as it's in auth.users)
            const updateData = {
                id: user.id,
                role,
                name: profileData.name,
                phone: profileData.phone,
                address: profileData.address,
                state: profileData.state,
                district: profileData.district,
                village_city: profileData.village_city,
                pincode: profileData.pincode,
                farming_experience: profileData.farming_experience,
                crops_grown: crops,
                current_season: profileData.current_season,
                expected_yield: profileData.expected_yield,
                sowing_date: profileData.sowing_date,
                harvest_date: profileData.harvest_date,
                land_details: profileData.land_details
            }

            const { error } = await supabase.from('profiles').upsert(updateData)

            if (error) throw error

            showToast('Profile updated successfully')
            setIsEditing(false)
            await fetchProfile() // Ensure local state is synced with DB
        } catch (error) {
            console.error("Profile update error:", error?.message || error?.code || error)
            showToast(`Update failed: ${error.message}`, 'error')
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
            setUploading(true)
            const fileName = `${user.id}.${file.name.split('.').pop()}`
            await supabase.storage.from('profiles').upload(fileName, file, { upsert: true })
            const { data } = supabase.storage.from('profiles').getPublicUrl(fileName)
            await supabase.from('profiles').upsert({ id: user.id, role, profile_image: data.publicUrl })
            setProfileData(p => ({ ...p, profile_image: data.publicUrl }))
            showToast('Profile image updated')
        } catch {
            showToast('Image upload failed', 'error')
        } finally {
            setUploading(false)
        }
    }

    if (!user) return null

    const updateField = (field, value) => setProfileData(prev => ({ ...prev, [field]: value }))

    return (
        <div className="min-h-screen bg-green-50/50 pt-28 px-4 pb-12">
            <Toast message={toast.show ? toast.message : ''} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
                        <div className="bg-gradient-to-br from-green-500 to-emerald-700 h-32 relative">
                            {isEditing && <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white backdrop-blur-sm transition-all"><X size={20} /></button>}
                        </div>

                        <div className="px-6 pb-6 relative -mt-16">
                            <div className="relative mb-4 flex justify-between items-end">
                                <div className="relative group">
                                    <img
                                        src={profileData.profile_image?.length > 10 ? profileData.profile_image : 'https://via.placeholder.com/150'}
                                        className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-lg bg-white"
                                        alt="Profile"
                                    />
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
                                        onChange={e => updateField('name', e.target.value)}
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

                            {/* Profile Completion */}
                            <div className="mb-6">
                                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                    <span>Profile Completion</span>
                                    <span className={completion === 100 ? 'text-green-600' : 'text-orange-500'}>{completion}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ease-out ${completion === 100 ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${completion}%` }} />
                                </div>
                                {completion < 100 && <p className="text-xs text-orange-500 mt-2 flex items-center gap-1"><AlertCircle size={12} /> Complete profile to enable crop selling</p>}
                            </div>

                            {isEditing ? (
                                <button onClick={handleUpdateProfile} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-transform active:scale-95 flex items-center justify-center gap-2">
                                    <Save size={18} /> Save Changes
                                </button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="w-full bg-white text-green-700 border-2 border-green-100 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors flex items-center justify-center gap-2">
                                    <Edit size={18} /> Edit Profile
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="bg-green-100 p-2 rounded-lg text-green-600"><Phone size={18} /></span> Contact Info
                        </h3>
                        <div className="space-y-4">
                            <InputField label="Email Address" value={profileData.email} icon={Mail} isEditing={isEditing} onChange={val => updateField('email', val)} />
                            <InputField label="Phone Number" value={profileData.phone} icon={Phone} isEditing={isEditing} required onChange={val => updateField('phone', val)} />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Location & Farm Details */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-green-50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-green-100 p-3 rounded-xl text-green-700"><MapPin size={24} /></div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Location & Details</h2>
                                <p className="text-sm text-gray-500">Your address and farming specifics</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="State" value={profileData.state} icon={MapPin} isEditing={isEditing} required onChange={val => updateField('state', val)} />
                            <InputField label="District" value={profileData.district} icon={MapPin} isEditing={isEditing} required onChange={val => updateField('district', val)} />
                            <InputField label="Village / City" value={profileData.village_city} icon={MapPin} isEditing={isEditing} required onChange={val => updateField('village_city', val)} />
                            <InputField label="Pincode" value={profileData.pincode} icon={MapPin} type="number" isEditing={isEditing} required onChange={val => updateField('pincode', val)} />
                            <div className="md:col-span-2">
                                <InputField label="Full Address" value={profileData.address} icon={MapPin} isEditing={isEditing} onChange={val => updateField('address', val)} />
                            </div>
                        </div>
                    </div>

                    {/* Farmer Details & History */}
                    {role === 'farmer' && (
                        <>
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-green-50">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="bg-green-100 p-3 rounded-xl text-green-700"><Tractor size={24} /></div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Farming Profile</h2>
                                        <p className="text-sm text-gray-500">Experience and crop details</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Experience (Years)" value={profileData.farming_experience} icon={Calendar} isEditing={isEditing} required type="number" onChange={val => updateField('farming_experience', val)} />
                                    <InputField label="Land Size / Details" value={profileData.land_details} icon={Ruler} isEditing={isEditing} onChange={val => updateField('land_details', val)} />
                                    <div className="md:col-span-2">
                                        <InputField label="Crops Grown (comma separated)" value={profileData.crops_grown} icon={Sprout} isEditing={isEditing} placeholder="e.g. Wheat, Rice" required onChange={val => updateField('crops_grown', val)} />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><History className="text-green-600" /> Sales History</h3>
                                {history.length === 0 ? (
                                    <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100 border-dashed">
                                        <Sprout size={32} className="mx-auto text-green-300 mb-2" />
                                        <p className="text-gray-500 font-medium">No sales recorded yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {history.map(h => (
                                            <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm"><CheckCircle size={18} /></div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{h.name}</p>
                                                        <p className="text-xs text-gray-500">{new Date(h.created_at).toLocaleDateString()}</p>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
