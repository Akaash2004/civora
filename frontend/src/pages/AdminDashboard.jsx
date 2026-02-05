import React from 'react';
import Navbar from '../components/Navbar';
import { Users, Shield, BarChart3, Settings, MoreVertical } from 'lucide-react';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">System Administration</h1>
                    <p className="text-gray-500 font-medium">Global control and system-wide analytics.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="bg-primary-100 p-4 rounded-2xl text-primary-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Citizens</p>
                            <p className="text-2xl font-black text-gray-900">1,204</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
                            <Shield size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Authorities</p>
                            <p className="text-2xl font-black text-gray-900">45</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Department Management</h2>
                            <button className="text-primary-600 font-bold hover:underline">New Account</button>
                        </div>
                        <div className="space-y-4">
                            {['PWD', 'Sanitation', 'Water Supply', 'Electricity', 'Drainage'].map((dept) => (
                                <div key={dept} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-gray-600">
                                            {dept[0]}
                                        </div>
                                        <span className="font-bold text-gray-900">{dept}</span>
                                    </div>
                                    <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                        <MoreVertical size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
