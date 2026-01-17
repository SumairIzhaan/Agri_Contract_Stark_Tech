import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext'
import { supabase } from '../supabaseClient'
import { User, Phone, MapPin, CheckCircle, ArrowLeft, Package } from 'lucide-react'

const OrderDetails = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [orderData, setOrderData] = useState(null)
    const [buyerProfile, setBuyerProfile] = useState(null)
    const [cropImage, setCropImage] = useState(null)
    const [loading, setLoading] = useState(false)

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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/crops`)
            const crops = await res.json()
            const crop = crops.find(c => c.name === cropName)
            if (crop?.image) setCropImage(`${import.meta.env.VITE_API_URL}${crop.image}`)
        } catch { }
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

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contract/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Contract_${payload.deal.contractId}.pdf`
            a.click()
            URL.revokeObjectURL(url)

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
