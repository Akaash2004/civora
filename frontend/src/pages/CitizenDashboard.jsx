import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Plus, Filter, MessageSquare, MapPin, ThumbsUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CitizenDashboard = () => {
    const [complaints, setComplaints] = useState([
        { id: 1, title: 'Broken Street Light', category: 'Electricity', status: 'Pending', votes: 12, date: '2024-02-05', location: 'Near Central Park' },
        { id: 2, title: 'Garbage Pileup', category: 'Sanitation', status: 'In Progress', votes: 45, date: '2024-02-04', location: 'Block B, Sector 4' },
    ]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={14} />;
            case 'In Progress': return <AlertCircle size={14} />;
            case 'Resolved': return <CheckCircle2 size={14} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Citizen Dashboard</h1>
                        <p className="text-gray-500 mt-1">Track and report civic issues in your area.</p>
                    </div>
                    <button className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02]">
                        <Plus size={20} />
                        New Complaint
                    </button>
                </div>

                {/* Categories / Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Submitted', value: '12', color: 'bg-white' },
                        { label: 'Pending', value: '5', color: 'bg-white' },
                        { label: 'In Progress', value: '4', color: 'bg-white' },
                        { label: 'Resolved', value: '3', color: 'bg-white text-emerald-600' },
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.color} p-6 rounded-2xl border border-gray-200 shadow-sm`}>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-3xl font-bold mt-2">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Complaints List Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">Recent Complaints</h2>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 border border-gray-200">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {complaints.map((complaint) => (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                key={complaint.id}
                                className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0 flex items-center justify-center text-gray-400">
                                        <MessageSquare size={24} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusStyle(complaint.status)}`}>
                                                {getStatusIcon(complaint.status)}
                                                {complaint.status}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{complaint.category}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">{complaint.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><MapPin size={14} /> {complaint.location}</span>
                                            <span>•</span>
                                            <span>{complaint.date}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-primary-500 hover:text-primary-600 transition-all font-semibold text-gray-600">
                                        <ThumbsUp size={18} />
                                        {complaint.votes} Votes
                                    </button>
                                    <button className="text-primary-600 font-bold hover:underline text-sm">View Details</button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-6 bg-gray-50/30 text-center">
                        <button className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors">View All Complaints</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CitizenDashboard;
