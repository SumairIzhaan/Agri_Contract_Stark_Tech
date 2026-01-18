import React, { useEffect, useState } from 'react'
import { useAuth } from '../Context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Toast from '../Components/Common/Toast'


const FarmerLogin = () => {
    const [mode, setMode] = useState('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState({ message: '', type: '', show: false })

    const { signIn, signUp, signOut, user, role } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user && role === 'farmer') {
            navigate('/', { replace: true })
        }
    }, [user, role, navigate])

    const showToast = (message, type = 'success') => {
        setToast({ message, type, show: true })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (mode === 'signup') {
                const { error } = await signUp({
                    email: email.trim(),
                    password: password.trim(),
                    role: 'farmer',
                    name: name.trim(),
                    phone: phone.trim()
                })

                if (error) throw error

                showToast('Signup successful! Please login.')
                setTimeout(() => setMode('login'), 1500)
            } else {
                const { error, role: userRole } = await signIn({
                    email: email.trim(),
                    password: password.trim()
                })

                if (error) throw error

                if (userRole !== 'farmer') {
                    await signOut()
                    throw new Error('This account is not registered as a farmer')
                }

                showToast('Login successful')
                navigate('/')
            }
        } catch (err) {
            showToast(err.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-green-50">
            <Toast
                message={toast.show ? toast.message : ''}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />

            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="w-[350px] bg-white p-8 rounded-2xl shadow-lg text-center border border-green-100">
                    <h2 className="text-2xl font-semibold text-green-900 mb-2">
                        Farmer {mode === 'signup' ? 'Signup' : 'Login'}
                    </h2>

                    <p className="text-sm text-green-600 mb-6">
                        {mode === 'signup' ? 'Create farmer account' : 'Login to farmer dashboard'}
                    </p>

                    <form onSubmit={onSubmitHandler}>
                        {mode === 'signup' && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border mb-3"
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border mb-3"
                                    required
                                />
                            </>
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border mb-3"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border mb-4"
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-green-600 text-white rounded-xl font-medium"
                        >
                            {mode === 'signup' ? 'Sign Up' : 'Login'}
                        </button>
                    </form>

                    <p className="text-green-700 text-sm mt-4">
                        {mode === 'signup' ? (
                            <>Already registered? <span onClick={() => setMode('login')} className="font-bold cursor-pointer">Login</span></>
                        ) : (
                            <>New farmer? <span onClick={() => setMode('signup')} className="font-bold cursor-pointer">Sign up</span></>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FarmerLogin
