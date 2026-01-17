import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, User, ChevronDown, LogOut, Briefcase, ShieldCheck, PlusCircle, ShoppingCart, Bell } from 'lucide-react';
import { useAuth } from '../../../Context/AuthContext';
import { supabase } from '../../../supabaseClient';
import NotificationList from '../../Common/NotificationList';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Use Global Auth Context
    const { user, role, loading, signOut } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        if (e) e.preventDefault();
        try {
            await signOut();
            setShowNotifications(false);
            setUnreadCount(0);
            // Force full reload to ensure clean state
            window.location.href = '/';
        } catch (error) {
            console.error("Logout failed", error);
            window.location.href = '/';
        }
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setShowNotifications(false);
    }, [location]);

    // Fetch unread count
    useEffect(() => {
        if (user) {
            const fetchUnreadCount = async () => {
                const { count, error } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('read', false);

                if (!error) setUnreadCount(count);
            };

            fetchUnreadCount();

            // Real-time subscription for badge with improved error handling
            const channelName = `navbar:notifications:${user.id}`;
            let subscription = null;
            let pollInterval = null;

            try {
                subscription = supabase
                    .channel(channelName, {
                        config: {
                            broadcast: { self: true },
                            presence: { key: user.id }
                        }
                    })
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    }, (payload) => {
                        console.log("Navbar: Received real-time notification update", payload);
                        fetchUnreadCount();
                    })
                    .subscribe((status, err) => {
                        if (status === 'SUBSCRIBED') {
                            console.log("Navbar: Successfully subscribed to notifications");
                            // Clear polling if subscription succeeds
                            if (pollInterval) {
                                clearInterval(pollInterval);
                                pollInterval = null;
                            }
                        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                            console.warn(`Navbar: Subscription issue (${status}). Falling back to polling.`, err);
                            // Fallback to polling every 10 seconds if realtime fails
                            if (!pollInterval) {
                                pollInterval = setInterval(fetchUnreadCount, 10000);
                            }
                        }
                    });
            } catch (error) {
                console.error("Navbar: Failed to create subscription", error);
                // Fallback to polling if subscription creation fails
                pollInterval = setInterval(fetchUnreadCount, 10000);
            }

            return () => {
                if (subscription) {
                    supabase.removeChannel(subscription).catch(err => console.warn("Cleanup error:", err));
                }
                if (pollInterval) {
                    clearInterval(pollInterval);
                }
            };
        }
    }, [user]);

    const navLinks = [
        { name: 'Home', path: '/' },
        {
            name: 'Crops',
            path: '#',
            subLinks: [
                { name: 'Kharif Crops', path: '/crops/kharif' },
                { name: 'Rabi Crops', path: '/crops/rabi' },
                { name: 'Vegetables', path: '/crops/vegetables' },
                { name: 'Fruits', path: '/crops/fruits' },
                { name: 'Flowers', path: '/crops/flowers' },
            ]
        },
        { name: 'Mandi Bhav', path: '/mandi' },
        { name: 'About Us', path: '/about' },
        { name: 'Community', path: '/community' },
    ];

    const isHome = location.pathname === '/';

    const navbarClasses = `fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen || !isHome
        ? 'bg-white/90 backdrop-blur-md shadow-md py-2'
        : 'bg-transparent py-4'
        }`;

    const linkClasses = (path) => `font-medium transition-colors duration-300 text-lg ${isScrolled || isMobileMenuOpen || !isHome
        ? location.pathname === path ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
        : location.pathname === path ? 'text-green-400' : 'text-white hover:text-green-300'
        }`;

    return (
        <nav className={navbarClasses}>
            <div className="container mx-auto px-4 md:px-6 flex justify-between items-center relative">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <span className={`text-2xl font-bold font-sans ${isScrolled || isMobileMenuOpen || !isHome ? 'text-gray-800' : 'text-white'}`}>
                        Agri<span className="text-green-500">Guide</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <div key={link.name} className="relative group">
                            <Link
                                to={link.path}
                                className={`${linkClasses(link.path)} flex items-center gap-1`}
                                onClick={(e) => link.subLinks && e.preventDefault()}
                            >
                                {link.name}
                            </Link>

                            {/* Dropdown Menu */}
                            {link.subLinks && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    {link.subLinks.map((subLink) => (
                                        <Link
                                            key={subLink.name}
                                            to={subLink.path}
                                            className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors text-sm font-medium border-l-4 border-transparent hover:border-green-500"
                                        >
                                            {subLink.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Role Specific Buttons - ONLY for Logged In Users */}
                    {user && role === 'farmer' && (
                        <Link
                            to="/seller"
                            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full font-bold hover:bg-green-600 transition-transform hover:scale-105 shadow-lg mx-2"
                        >
                            <PlusCircle size={18} />
                            Sell Crop
                        </Link>
                    )}
                    {user && role === 'buyer' && (
                        <Link
                            to="/buyer"
                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-600 transition-transform hover:scale-105 shadow-lg mx-2"
                        >
                            <ShoppingCart size={18} />
                            Buy Crops
                        </Link>
                    )}



                    {/* Notification Bell (Only for logged in users) */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2 rounded-full transition-all ${isScrolled || !isHome
                                    ? 'text-gray-600 hover:bg-gray-100'
                                    : 'text-white hover:bg-white/20'}`}
                            >
                                <Bell size={24} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <NotificationList onClose={() => setShowNotifications(false)} />
                            )}
                        </div>
                    )}


                    {/* Auth Section with Hover Interface */}
                    <div className="relative group">
                        <button
                            className={`flex items-center gap-2 px-3 py-2 rounded-full font-semibold transition-all ${isScrolled || user
                                ? 'bg-white text-green-700 shadow-sm border border-gray-100'
                                : 'bg-white/20 text-white backdrop-blur-sm'
                                }`}
                        >
                            {/* STRICT LOGIC: Only show Profile if NOT loading AND User exists */}
                            {!loading && user ? (
                                <>
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center overflow-hidden border-2 border-green-500">
                                        <User size={16} className="text-green-700" />
                                    </div>
                                    <span className={`hidden sm:block text-sm ${isScrolled ? 'text-gray-800' : 'text-gray-800'}`}>{user.user_metadata?.name || user.email?.split('@')[0]}</span>
                                    <ChevronDown size={16} className="text-gray-500" />
                                </>
                            ) : (
                                <>
                                    {/* Default to Login button while loading or if no user */}
                                    <User size={18} />
                                    <span>Login</span>
                                    <ChevronDown size={16} />
                                </>
                            )}
                        </button>

                        {/* Hover Dropdown Interface */}
                        <div className="absolute top-full right-0 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                                {user ? (
                                    // Logged In Menu
                                    <div className="py-2">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-bold text-gray-800">{user.user_metadata?.name || 'User'}</p>
                                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold text-green-600">{role || 'Member'}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <ShieldCheck size={18} /> My Profile
                                        </Link>

                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </div>
                                ) : (
                                    // Login Options Interface
                                    <div className="p-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Select Login Type</p>
                                        <div className="flex flex-col gap-2">
                                            <Link to="/login/farmer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 transition-all border border-transparent hover:border-green-200 group/item">
                                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover/item:bg-green-600 group-hover/item:text-white transition-colors">
                                                    <Leaf size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">
                                                        Farmer
                                                    </p>
                                                    <p className="text-xs text-gray-500">Sell crops & get advice</p>
                                                </div>
                                            </Link>

                                            <Link to="/login/buyer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200 group/item">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">Buyer</p>
                                                    <p className="text-xs text-gray-500">Buy fresh produce</p>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600 focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? (
                        <X size={28} className="text-gray-800" />
                    ) : (
                        <Menu size={28} className={isScrolled || !isHome ? 'text-gray-800' : 'text-white'} />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="flex flex-col p-4 gap-4">
                    {navLinks.map((link) => (
                        <div key={link.name} className="flex flex-col">
                            {link.subLinks ? (
                                <>
                                    <div className="text-gray-700 font-bold py-2 px-4">
                                        {link.name}
                                    </div>
                                    <div className="pl-6 flex flex-col gap-2 border-l-2 border-gray-100 ml-4">
                                        {link.subLinks.map(subLink => (
                                            <Link
                                                key={subLink.name}
                                                to={subLink.path}
                                                className="text-gray-600 font-medium py-1 hover:text-green-600 transition-colors"
                                            >
                                                {subLink.name}
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <Link
                                    to={link.path}
                                    className="text-gray-700 font-medium py-2 hover:text-green-600 hover:bg-gray-50 px-4 rounded-lg transition-colors border-l-4 border-transparent hover:border-green-500"
                                >
                                    {link.name}
                                </Link>
                            )}
                        </div>
                    ))}



                    {/* Mobile Role Action Buttons - ONLY for Logged In Users */}
                    {user && role === 'farmer' && (
                        <Link
                            to="/seller"
                            className="flex justify-center items-center gap-2 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors shadow-sm mb-2"
                        >
                            <PlusCircle size={20} />
                            Sell Crop
                        </Link>
                    )}

                    {user && role === 'buyer' && (
                        <Link
                            to="/buyer"
                            className="flex justify-center items-center gap-2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                        >
                            <ShoppingCart size={20} />
                            Buy Crops
                        </Link>
                    )}


                    {user ? (
                        <button onClick={handleLogout} className="flex justify-center items-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg hover:bg-red-100 transition-colors">
                            <LogOut size={20} /> Logout ({user.user_metadata?.name})
                        </button>
                    ) : (
                        <Link
                            to="/login/farmer"
                            className="flex justify-center items-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <User size={20} />
                            Login / Sign Up
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;