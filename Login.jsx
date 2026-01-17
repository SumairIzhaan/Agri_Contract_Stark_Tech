import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [role, setRole] = useState('farmer'); // 'farmer' or 'buyer'
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Mock login - navigate based on role
        if (role === 'farmer') navigate('/seller');
        else navigate('/buyer');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-[100px]">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">

                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Leaf className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sign in to access your dashboard
                    </p>
                </div>

                {/* Role Switcher */}
                <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button
                        onClick={() => setRole('farmer')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'farmer'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Farmer
                    </button>
                    <button
                        onClick={() => setRole('buyer')}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${role === 'buyer'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Buyer
                    </button>
                </div>

                {/* Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
                                placeholder="Email address"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-colors"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-green-600 hover:text-green-500">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-lg hover:shadow-green-500/30"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <ArrowRight className="h-5 w-5 text-green-500 group-hover:text-green-400" />
                            </span>
                            Sign in as {role === 'farmer' ? 'Farmer' : 'Buyer'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-green-600 hover:text-green-500">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
