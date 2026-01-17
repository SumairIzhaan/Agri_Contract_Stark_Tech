import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Check if we are on the home page (handle potential trailing slash)
    const isHome = location.pathname === '/' || location.pathname === '';

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Farmer Info', path: '/farmer-info' },
    ];

    // Logic: If on Home page, use transparent until scrolled.
    // If NOT on Home page, ALWAYS use the "scrolled" style (White bg, Dark text)
    const showWhiteBg = scrolled || !isHome;

    // Determine text colors based on state
    // Scrolled/WhiteBg: Black text -> Green 600 Hover
    // Transparent: White text -> Green 400 Hover
    const textColorClass = showWhiteBg ? 'text-black hover:text-green-600' : 'text-white hover:text-green-400';
    const logoTextClass = showWhiteBg ? 'text-black' : 'text-white';

    // Toggle Button Styles
    const toggleContainerClass = showWhiteBg ? 'bg-gray-100 border-gray-200' : 'bg-white/20 border-white/30 backdrop-blur-sm';
    const toggleInactiveText = showWhiteBg ? 'text-gray-600' : 'text-white';

    // Login Button Styles
    const loginBtnClass = showWhiteBg
        ? 'bg-green-600 text-white hover:bg-green-700'
        : 'bg-white/20 text-white backdrop-blur-md hover:bg-white/30 border border-white/30';

    // Mobile Menu Toggle
    const mobileToggleColor = showWhiteBg ? 'text-gray-700' : 'text-white';

    return (
        <nav
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 h-[80px] flex items-center ${showWhiteBg ? 'bg-white shadow-md' : 'bg-transparent'
                }`}
        >
            <div className="max-w-[92%] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="flex justify-between items-center h-full">

                    {/* Left: Logo & Brand */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                        <img className="h-10 w-auto object-contain" src={logo} alt="BhumiPutra Logo" />
                        <span className={`font-bold text-2xl tracking-tight transition-colors duration-300 group-hover:text-green-500 ${logoTextClass}`}>
                            Bhumi<span className="text-green-500 group-hover:text-green-400">Putra</span>
                        </span>
                    </Link>

                    {/* Center: Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-lg font-medium transition-colors ${textColorClass}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right: Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Segmented Toggle for Seller/Buyer */}
                        <div className={`flex p-1 rounded-full border ${toggleContainerClass}`}>
                            <Link
                                to="/seller"
                                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${location.pathname === '/seller'
                                        ? 'bg-green-600 text-white shadow-sm'
                                        : `${toggleInactiveText} hover:bg-green-100 hover:text-green-700`
                                    }`}
                            >
                                Seller
                            </Link>
                            <Link
                                to="/buyer"
                                className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${location.pathname === '/buyer'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : `${toggleInactiveText} hover:bg-blue-100 hover:text-blue-700`
                                    }`}
                            >
                                Buyer
                            </Link>
                        </div>

                        {/* Login Button */}
                        <Link
                            to="/login"
                            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium transition-colors ${loginBtnClass}`}
                        >
                            <User size={18} />
                            Login
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className={`${mobileToggleColor} hover:text-green-600 focus:outline-none`}
                        >
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-[80px] left-0 w-full bg-white shadow-xl border-t border-gray-100 px-4 py-6 space-y-4">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="block text-lg font-medium text-gray-800 hover:text-green-600 py-2 border-b border-gray-50 last:border-0"
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="pt-4 flex flex-col gap-3">
                        <div className="flex justify-between gap-4">
                            <Link
                                to="/seller"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 text-center bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-green-100 hover:text-green-700 transition-all"
                            >
                                Seller
                            </Link>
                            <Link
                                to="/buyer"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 text-center bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-blue-100 hover:text-blue-700 transition-all"
                            >
                                Buyer
                            </Link>
                        </div>
                        <Link
                            to="/login"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center text-white bg-green-600 font-semibold py-3 rounded-xl hover:bg-green-700"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
