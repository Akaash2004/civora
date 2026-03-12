import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import api, { API_BASE_URL } from '../utils/api';
import { Filter, MessageCircle, Clock, CheckCircle2, AlertTriangle, MapPin, X, Upload, ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthorityDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    // Resolution modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [activeComplaint, setActiveComplaint] = useState(null);
    const [targetStatus, setTargetStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [proofFile, setProofFile] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [proofError, setProofError] = useState('');
    const fileInputRef = useRef(null);

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

    const sortedComplaints = [...complaints].sort((a, b) => {
        const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const pA = priorityWeight[a.priority] || 0;
        const pB = priorityWeight[b.priority] || 0;
        if (pB !== pA) return pB - pA;
        return (b.votes?.length || 0) - (a.votes?.length || 0);
    });

    const openModal = (complaint, status) => {
        setActiveComplaint(complaint);
        setTargetStatus(status);
        setRemarks('');
        setProofFile(null);
        setProofPreview(null);
        setProofError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setActiveComplaint(null);
        setProofFile(null);
        setProofPreview(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProofFile(file);
        setProofError('');
        const reader = new FileReader();
        reader.onloadend = () => setProofPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Proof is required when marking as Resolved
        if (targetStatus === 'Resolved' && !proofFile) {
            setProofError('A proof image is required to close this case.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('status', targetStatus);
            if (remarks) formData.append('remarks', remarks);
            if (proofFile) formData.append('resolutionProof', proofFile);

            await api.patch(`/complaints/${activeComplaint._id}`, formData);

            closeModal();
            fetchComplaints();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
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
                            {sortedComplaints.map((complaint) => (
                                <motion.div
                                    key={complaint._id}
                                    layout
                                    className="group bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 p-6 rounded-[2rem] transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                                >
                                    <div className="flex gap-6 items-center">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-200">
                                            <img
                                                src={complaint.imageUrl?.startsWith('http') ? complaint.imageUrl : `${API_BASE_URL}/${complaint.imageUrl}`}
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
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                    complaint.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                    complaint.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {complaint.priority} Priority
                                                </span>
                                                <span className="text-gray-500 text-sm font-semibold flex items-center gap-1">
                                                    • {complaint.votes?.length || 0} Votes
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full md:w-auto">
                                        {complaint.status === 'Pending' && (
                                            <button
                                                onClick={() => openModal(complaint, 'In Progress')}
                                                className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 hover:border-blue-500 text-blue-600 font-bold rounded-xl transition-all"
                                            >
                                                Start Working
                                            </button>
                                        )}
                                        {complaint.status === 'In Progress' && (
                                            <button
                                                onClick={() => openModal(complaint, 'Resolved')}
                                                className="flex-1 md:flex-none px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-all"
                                            >
                                                Mark Resolved
                                            </button>
                                        )}
                                        {complaint.status === 'Pending' && (
                                            <button
                                                onClick={() => openModal(complaint, 'Fake/Invalid')}
                                                className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 hover:border-red-400 text-red-500 font-bold rounded-xl transition-all"
                                            >
                                                Flag Invalid
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Resolution Modal */}
            <AnimatePresence>
                {modalOpen && activeComplaint && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className={`p-6 flex justify-between items-start ${
                                targetStatus === 'Resolved' ? 'bg-emerald-50 border-b border-emerald-100' :
                                targetStatus === 'Fake/Invalid' ? 'bg-red-50 border-b border-red-100' :
                                'bg-blue-50 border-b border-blue-100'
                            }`}>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900">
                                        {targetStatus === 'Resolved' && '✅ Submit Resolution'}
                                        {targetStatus === 'In Progress' && '🔧 Start Working'}
                                        {targetStatus === 'Fake/Invalid' && '🚫 Flag as Invalid'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1 font-medium line-clamp-1">
                                        {activeComplaint.description}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-white/80 rounded-xl transition-all text-gray-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Remarks */}
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-1">
                                        Add Update / Remark <span className="text-gray-400 normal-case font-medium">(optional)</span>
                                    </label>
                                    <p className="text-xs text-gray-400 font-medium mb-2">This will be added to the complaint's update history visible to the citizen.</p>
                                    <textarea
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder={
                                            targetStatus === 'In Progress' ? 'E.g. Team has been dispatched to the site...' :
                                            targetStatus === 'Resolved' ? 'E.g. Pothole has been filled and road resurfaced.' :
                                            'E.g. Complaint reviewed — no valid evidence found.'
                                        }
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 resize-none transition-all"
                                    />
                                </div>

                                {/* Proof Image Upload — shown for Resolved status */}
                                {targetStatus === 'Resolved' && (
                                    <div>
                                        <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">
                                            Final Proof Image <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-xs text-gray-400 font-medium mb-3">
                                            Upload a photo confirming the issue has been resolved (e.g. repaired road, fixed pipe).
                                        </p>

                                        {/* Drop Zone */}
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
                                                proofPreview ? 'border-emerald-300 bg-emerald-50' :
                                                proofError ? 'border-red-300 bg-red-50' :
                                                'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50'
                                            }`}
                                        >
                                            {proofPreview ? (
                                                <div className="relative">
                                                    <img
                                                        src={proofPreview}
                                                        alt="Proof preview"
                                                        className="w-full h-48 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <p className="text-white font-bold text-sm">Click to change</p>
                                                    </div>
                                                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                                                        ✓ Ready
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 px-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${proofError ? 'bg-red-100' : 'bg-primary-100'}`}>
                                                        <ImageIcon size={24} className={proofError ? 'text-red-500' : 'text-primary-600'} />
                                                    </div>
                                                    <p className="font-bold text-gray-700 text-sm">Click to upload proof</p>
                                                    <p className="text-xs text-gray-400 mt-1">JPG, JPEG or PNG</p>
                                                </div>
                                            )}
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        {proofError && (
                                            <p className="text-xs text-red-600 font-semibold mt-2 flex items-center gap-1">
                                                <AlertTriangle size={12} /> {proofError}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className={`flex-1 px-5 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                            targetStatus === 'Resolved' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                                            targetStatus === 'Fake/Invalid' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                            'bg-blue-600 hover:bg-blue-700 text-white'
                                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                                </svg>
                                                Submitting...
                                            </span>
                                        ) : (
                                            <>
                                                {targetStatus === 'Resolved' && <><Upload size={16} /> Submit & Close Case</>}
                                                {targetStatus === 'In Progress' && <><CheckCircle2 size={16} /> Confirm</>}
                                                {targetStatus === 'Fake/Invalid' && <>🚫 Confirm Flag</>}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuthorityDashboard;
