import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../Components/Common/Toast';
import { Loader2, User, Tractor, ShoppingBag } from 'lucide-react';

const Signup = () => {
    const [role, setRole] = useState('farmer'); // Default role
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '', show: false });

    const { signUp } = useAuth();
    const navigate = useNavigate();

    const showToast = (message, type = 'success') => {
        setToast({ message, type, show: true });
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await signUp({
                email: email.trim(),
                password: password.trim(),
                role,
                name: name.trim(),
                phone: phone.trim()
            });

            if (error) throw error;

            showToast('Signup successful! Please login.', 'success');

            // Redirect to the appropriate login page after a short delay
            setTimeout(() => {
                navigate(role === 'farmer' ? '/login/farmer' : '/login/buyer');
            }, 1500);

        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${role === 'farmer' ? 'bg-green-50' : 'bg-blue-50'}`}>
            <Toast
                message={toast.show ? toast.message : ''}
                type={toast.type}
                onClose={() => setToast({ ...toast, show: false })}
            />

            <div className={`w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border transition-colors duration-500 ${role === 'farmer' ? 'border-green-100' : 'border-blue-100'}`}>

                <h2 className={`text-3xl font-bold text-center mb-2 transition-colors ${role === 'farmer' ? 'text-green-800' : 'text-blue-800'}`}>
                    Create Account
                </h2>
                <p className="text-center text-gray-500 mb-8">Join our community today</p>

                {/* Role Selection Toggles */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-8 relative">
                    <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out ${role === 'farmer' ? 'left-1 translate-x-0' : 'left-1 translate-x-[100%]'}`}></div>

                    <button
                        type="button"
                        onClick={() => setRole('farmer')}
                        className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${role === 'farmer' ? 'text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Tractor size={18} /> Farmer
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('buyer')}
                        className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${role === 'buyer' ? 'text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ShoppingBag size={18} /> Buyer
                    </button>
                </div>

                <form onSubmit={onSubmitHandler} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            placeholder="Enter 10-digit number"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            placeholder="Create a strong password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2 ${role === 'farmer'
                                ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-green-500/30'
                                : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-blue-500/30'
                            }`}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        Already have an account?{' '}
                        <span className="font-semibold text-gray-800">
                            Log in as{' '}
                            <Link to="/login/farmer" className="text-green-600 hover:underline">Farmer</Link>
                            {' or '}
                            <Link to="/login/buyer" className="text-blue-600 hover:underline">Buyer</Link>
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
