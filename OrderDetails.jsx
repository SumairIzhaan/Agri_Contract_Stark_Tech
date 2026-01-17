import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { supabase } from '../supabaseClient'
import { User, Phone, MapPin, CheckCircle, ArrowLeft, Package, CreditCard, Wallet, Banknote } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { IoCall } from 'react-icons/io5'

// Phone number formatter utility for WhatsApp
const formatPhoneForWhatsApp = (phone) => {
    if (!phone) return null

    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '')

    // If number already starts with country code (91 for India) and is 12 digits, return as is
    if (cleaned.startsWith('91') && cleaned.length === 12) {
        return cleaned
    }

    // If 10-digit number, add India country code
    if (cleaned.length === 10) {
        return `91${cleaned}`
    }

    // Return cleaned number for other cases
    return cleaned
}

const OrderDetails = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [orderData, setOrderData] = useState(null)
    const [buyerProfile, setBuyerProfile] = useState(null)
    const [cropImage, setCropImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [paymentMode, setPaymentMode] = useState(null)

    useEffect(() => {
        if (!location.state?.data) {
            navigate('/')
            return
        }

        const data = location.state.data
        setOrderData(data)

        if (data.buyerId) fetchBuyer(data.buyerId)
        if (data.cropName) fetchCropImage(data.cropName)
    }, [location, navigate])

    const fetchBuyer = async (id) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single()

        setBuyerProfile(data)
    }

    const fetchCropImage = async (cropName) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/crops`)
            const crops = await res.json()
            const crop = crops.find(c => c.name === cropName)
            if (crop?.image) setCropImage(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${crop.image}`)
        } catch (err) {
            console.warn('Failed to fetch crop image:', err);
        }
    }

    const handleGenerateContract = async () => {
        try {
            setLoading(true)

            const payload = {
                farmer: {
                    name: user?.user_metadata?.name || 'Farmer',
                    phone: user?.user_metadata?.phone || 'N/A'
                },
                buyer: {
                    name: buyerProfile?.name || orderData.buyerName,
                    phone: buyerProfile?.phone || orderData.buyerPhone,
                    district: buyerProfile?.district || orderData.buyerLocation
                },
                crop: { name: orderData.cropName },
                deal: {
                    contractId: `CNT-${Date.now()}`,
                    quantity: orderData.quantity || 10,
                    pricePerQuintal: orderData.price,
                    totalAmount: (orderData.quantity || 10) * orderData.price
                }
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/contract/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                throw new Error(`Contract generation failed: ${res.status}`);
            }

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Contract_${payload.deal.contractId}.pdf`
            a.click()
            URL.revokeObjectURL(url)

        } catch (err) {
            console.error('Contract generation failed:', err);
            alert('Failed to generate contract. Please try again.');
        } finally {
            setLoading(false)
        }
    }

    if (!orderData) return null

    return (
        <div className="min-h-screen bg-green-50 pt-24 px-4">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-gray-600">
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="bg-white rounded-2xl shadow border">
                    <div className="bg-green-600 text-white px-8 py-6">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={22} />
                            <h1 className="text-xl font-bold">Order Accepted</h1>
                        </div>
                    </div>

                    <div className="p-8">
                        <button
                            onClick={handleGenerateContract}
                            disabled={loading}
                            className="mb-8 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
                        >
                            {loading ? 'Generating...' : 'Generate Contract PDF'}
                        </button>

                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <User size={18} /> Buyer Information
                        </h2>

                        <div className="bg-green-50 p-6 rounded-xl mb-8">
                            <h3 className="font-bold text-lg">
                                {buyerProfile?.name || orderData.buyerName}
                            </h3>

                            <div className="mt-3 flex gap-6 text-sm">
                                <div className="flex gap-2 items-center">
                                    <Phone size={16} />
                                    {buyerProfile?.phone || orderData.buyerPhone}
                                </div>
                                <div className="flex gap-2 items-center">
                                    <MapPin size={16} />
                                    {buyerProfile?.district || orderData.buyerLocation}
                                </div>
                            </div>
                        </div>

                        <h2 className="font-bold mb-4 flex items-center gap-2 mt-8">
                            <Phone size={18} /> Contact Buyer
                        </h2>

                        <div className="bg-green-50 p-6 rounded-xl mb-8 border border-green-100">
                            <p className="text-sm text-gray-600 mb-4">
                                Get in touch with the buyer to discuss the deal details
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <a
                                    href={`tel:${buyerProfile?.phone || orderData.buyerPhone}`}
                                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md active:scale-95"
                                >
                                    <IoCall size={20} />
                                    Call Now
                                </a>

                                <a
                                    href={`https://wa.me/${formatPhoneForWhatsApp(buyerProfile?.phone || orderData.buyerPhone)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-md active:scale-95"
                                >
                                    <FaWhatsapp size={20} />
                                    WhatsApp
                                </a>
                            </div>
                        </div>

                        <h2 className="font-bold mb-4 flex items-center gap-2 mt-8">
                            <CreditCard size={18} /> Payment Mode
                        </h2>

                        <div className="bg-white border rounded-xl p-6 mb-8">
                            <p className="text-sm text-gray-500 mb-4">Select how you want to receive payment from the buyer:</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'cash', label: 'Cash on Delivery', icon: Banknote },
                                    { id: 'upi', label: 'UPI / Online', icon: Wallet },
                                    { id: 'bank', label: 'Bank Transfer', icon: CreditCard }
                                ].map((mode) => (
                                    <button
                                        key={mode.id}
                                        onClick={() => setPaymentMode(mode.id)}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${paymentMode === mode.id
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-100 hover:border-green-200 text-gray-600'
                                            }`}
                                    >
                                        <mode.icon size={24} />
                                        <span className="font-semibold text-sm">{mode.label}</span>
                                        {paymentMode === mode.id && <CheckCircle size={16} className="text-green-500" />}
                                    </button>
                                ))}
                            </div>

                            {paymentMode && (
                                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100 flex justify-between items-center animate-in fade-in">
                                    <div>
                                        <p className="text-sm font-semibold text-green-800">
                                            Selected: {paymentMode === 'cash' ? 'Cash Payment' : paymentMode === 'upi' ? 'Online/UPI' : 'Bank Transfer'}
                                        </p>
                                        <p className="text-xs text-green-600">Buyer will be notified of your preference.</p>
                                    </div>
                                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700">
                                        Confirm
                                    </button>
                                </div>
                            )}
                        </div>

                        <h2 className="font-bold mb-4 flex items-center gap-2">
                            <Package size={18} /> Order Summary
                        </h2>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl flex gap-3 items-center">
                                {cropImage && (
                                    <img src={cropImage} className="w-12 h-12 rounded object-cover" />
                                )}
                                <div>
                                    <p className="text-xs text-gray-500">Crop</p>
                                    <p className="font-bold">{orderData.cropName}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="font-bold">₹{orderData.price}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl">
                                <p className="text-xs text-gray-500">Order ID</p>
                                <p className="font-bold">#{orderData.cropId?.slice(0, 8)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails
