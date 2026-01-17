import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../Context/AuthContext'
import Toast from '../Components/Common/Toast'

const BuyerLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

    const { signIn, signOut, user, role } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user && role === 'buyer') {
            navigate('/buyer/dashboard', { replace: true })
        }

        if (user && role && role !== 'buyer') {
            navigate(`/${role}/dashboard`, { replace: true })
        }
    }, [user, role, navigate])

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error, role: userRole } = await signIn({
                email: email.trim(),
                password: password.trim()
            })

            if (error) throw error

            if (userRole !== 'buyer') {
                await signOut()
                throw new Error('This account is not registered as a buyer')
            }

            showToast('Login successful')
            navigate('/buyer/dashboard', { replace: true })

        } catch (err) {
            showToast(err.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center">
            <Toast
                message={toast.show ? toast.message : ''}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />

            <div className="w-[360px] bg-white p-8 rounded-2xl shadow-lg border border-blue-100 text-center">
                <h2 className="text-2xl font-semibold text-blue-900 mb-1">
                    Buyer Login
                </h2>

                <p className="text-sm text-blue-600 mb-6">
                    Access your buyer dashboard
                </p>

                <form onSubmit={onSubmitHandler} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded-xl border"
                        required
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-xl border"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-xl flex justify-center hover:bg-blue-700 transition"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
                    </button>
                </form>

                <p className="text-blue-700 text-sm mt-4">
                    New buyer?{' '}
                    <Link to="/signup/buyer" className="font-semibold hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default BuyerLogin
