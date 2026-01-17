import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Leaf } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div>
                        <Link to="/" className="flex items-center gap-2 mb-6 group">
                            <div className="bg-green-600 p-2 rounded-lg text-white">
                                <Leaf size={24} />
                            </div>
                            <span className="text-2xl font-bold text-white">
                                Bhumi<span className="text-green-500">Putra</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Empowering farmers with technology, knowledge, and community support to build a sustainable and prosperous future for agriculture.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-green-500 after:rounded-full">
                            Quick Links
                        </h3>
                        <ul className="space-y-4">
                            <li><Link to="/" className="hover:text-green-500 transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-green-500 transition-colors">About Us</Link></li>
                            <li><Link to="/services" className="hover:text-green-500 transition-colors">Our Services</Link></li>
                            <li><Link to="/blog" className="hover:text-green-500 transition-colors">Agricultural Blog</Link></li>
                            <li><Link to="/contact" className="hover:text-green-500 transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-green-500 after:rounded-full">
                            Our Services
                        </h3>
                        <ul className="space-y-4">
                            <li><Link to="/advisory" className="hover:text-green-500 transition-colors">Crop Advisory</Link></li>
                            <li><Link to="/weather" className="hover:text-green-500 transition-colors">Weather Forecast</Link></li>
                            <li><Link to="/market" className="hover:text-green-500 transition-colors">Market Prices (Mandi)</Link></li>
                            <li><Link to="/community" className="hover:text-green-500 transition-colors">Farmer Community</Link></li>
                            <li><Link to="/schemes" className="hover:text-green-500 transition-colors">Govt Schemes</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-6 relative inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-green-500 after:rounded-full">
                            Contact Us
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={20} className="text-green-500 mt-1 flex-shrink-0" />
                                <span>123 Agriculture Way, Green Valley, India - 400001</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-green-500 flex-shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-green-500 flex-shrink-0" />
                                <span>support@agriguide.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {currentYear} BhumiPutra. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;