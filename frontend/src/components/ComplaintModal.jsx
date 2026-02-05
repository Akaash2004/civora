import React, { useState } from 'react';
import { X, Camera, MapPin, UploadCloud, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const ComplaintModal = ({ isOpen, onClose, onRefresh }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Other');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('description', description);
            formData.append('category', category);
            // Mock location for now
            formData.append('latitude', '12.9716');
            formData.append('longitude', '77.5946');
            formData.append('address', 'Bengaluru, India');

            if (image) {
                formData.append('image', image);
            }

            await api.post('/complaints', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
                onRefresh();
                setSuccess(false);
                setDescription('');
                setCategory('Other');
                setImage(null);
            }, 2000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Report an Issue</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Complaint Submitted!</h3>
                            <p className="text-gray-500 mt-2">Authorities will be notified shortly.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload Placeholder */}
                            <div
                                className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-all cursor-pointer bg-gray-50"
                                onClick={() => { }}
                            >
                                <UploadCloud size={32} />
                                <p className="mt-2 text-sm font-semibold">Click to upload image</p>
                                <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Issue Category</label>
                                    <select
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option>PWD</option>
                                        <option>Sanitation</option>
                                        <option>Water Supply</option>
                                        <option>Electricity</option>
                                        <option>Drainage</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Description</label>
                                    <textarea
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[120px]"
                                        placeholder="Briefly describe the issue..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="flex items-center gap-2 text-primary-600 text-sm font-bold bg-primary-50 p-3 rounded-xl">
                                    <MapPin size={18} />
                                    <span>Automatically detecting location...</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ComplaintModal;
