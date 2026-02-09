import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api, { API_BASE_URL } from '../utils/api';
import { Filter, MessageCircle, Clock, CheckCircle2, AlertTriangle, ChevronRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthorityDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const { data } = await api.get('/complaints');
            setComplaints(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        const remarks = window.prompt("Enter remarks for this update (optional):");
        try {
            await api.patch(`/complaints/${id}`, { status, remarks });
            fetchComplaints();
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="pt-20 pb-12 px-4 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                            {user?.department} Dashboard
                        </h1>
                        <p className="text-gray-500 font-medium">Managing civic issues for your department.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Authority Stats */}
                    <div className="bg-black text-white p-8 rounded-[2rem]">
                        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Active Tasks</p>
                        <h2 className="text-5xl font-black mt-2">{complaints.filter(c => c.status !== 'Resolved').length}</h2>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MessageCircle className="text-primary-600" />
                        Pending Resolutions
                    </h2>

                    {loading ? (
                        <p>Loading complaints...</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {complaints.map((complaint) => (
                                <motion.div
                                    key={complaint._id}
                                    layout
                                    className="group bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 p-6 rounded-[2rem] transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                                >
                                    <div className="flex gap-6 items-center">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-200">
                                            <img
                                                src={complaint.imageUrl.startsWith('http') ? complaint.imageUrl : `${API_BASE_URL}/${complaint.imageUrl}`}
                                                alt="Issue"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${complaint.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                    complaint.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                    }`}>
                                                    {complaint.status}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                                                    <MapPin size={12} /> {complaint.location?.address || 'Unknown Location'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">{complaint.description}</h3>
                                            <p className="text-gray-500 text-sm mt-1">Priority: <span className="text-primary-600 font-bold">{complaint.priority}</span> • Votes: {complaint.votes?.length}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto">
                                        {complaint.status === 'Pending' && (
                                            <button
                                                onClick={() => handleUpdateStatus(complaint._id, 'In Progress')}
                                                className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 hover:border-blue-500 text-blue-600 font-bold rounded-xl transition-all"
                                            >
                                                Start Working
                                            </button>
                                        )}
                                        {complaint.status === 'In Progress' && (
                                            <button
                                                onClick={() => handleUpdateStatus(complaint._id, 'Resolved')}
                                                className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all font-bold"
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AuthorityDashboard;
