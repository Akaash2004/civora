import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Bell, Shield, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-xl border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group transition-all">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                            <Shield className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-gray-900">CIVORA</span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <button className="p-2.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all relative">
                                    <Bell size={22} />
                                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                </button>

                                <div className="h-8 w-px bg-gray-100 mx-2"></div>

                                <div className="flex items-center gap-3 pl-2">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                                            {user.phoneNumber || user.uniqueId || user.username}
                                        </p>
                                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest leading-none">
                                            {user.role}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => navigate(user.role === 'citizen' ? '/dashboard' : user.role === 'authority' ? '/dept-dashboard' : '/admin-dashboard')}
                                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <User size={20} />
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                        title="Logout"
                                    >
                                        <LogOut size={22} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-6 py-2.5 bg-black text-white text-sm font-bold rounded-xl shadow-lg hover:bg-gray-800 transition-all font-bold"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
