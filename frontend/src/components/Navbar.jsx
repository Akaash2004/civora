import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, User, Bell, Map as MapIcon, PlusCircle } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start">
                        <Link to="/dashboard" className="flex ml-2 md:mr-24">
                            <span className="self-center text-xl font-bold sm:text-2xl whitespace-nowrap text-primary-600 tracking-tight">CIVORA</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center ml-3">
                            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900 leading-none">{user?.phoneNumber || user?.username || 'User'}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                </div>
                                <div className="flex text-sm bg-primary-600 rounded-full focus:ring-4 focus:ring-gray-300" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                                    <span className="sr-only">Open user menu</span>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white">
                                        <User size={18} />
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="ml-4 p-2 text-gray-500 rounded-lg hover:text-red-600 hover:bg-red-50 transition-all"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
