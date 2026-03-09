import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, MapPin, UploadCloud, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const ComplaintModal = ({ isOpen, onClose, onRefresh }) => {
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Sanitation');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [location, setLocation] = useState({ lat: null, lng: null, address: 'Detecting location...' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            detectLocation();
        }
    }, [isOpen]);

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({
                        lat: latitude,
                        lng: longitude,
                        address: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                    });

                    // Reverse geocoding could be added here if an API key is available
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        if (data.display_name) {
                            setLocation(prev => ({ ...prev, address: data.display_name }));
                        }
                    } catch (err) {
                        console.error("Reverse geocoding failed", err);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setLocation({ lat: 0, lng: 0, address: "Location access denied. Please enter manually." });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setLocation({ lat: 0, lng: 0, address: "Geolocation not supported" });
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('description', description);
            formData.append('category', category);
            formData.append('latitude', location.lat || '0');
            formData.append('longitude', location.lng || '0');
            formData.append('address', location.address);

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
                setCategory('Sanitation');
                setImage(null);
                setImagePreview(null);
            }, 2000);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to submit complaint");
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
                className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Report an Issue</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
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
                            {/* Image Upload */}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />
                            <div
                                className="border-2 border-dashed border-gray-200 rounded-2xl p-4 min-h-[160px] flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-all cursor-pointer bg-gray-50 overflow-hidden relative"
                                onClick={() => fileInputRef.current.click()}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <UploadCloud size={32} />
                                        <p className="mt-2 text-sm font-semibold">Click to upload image</p>
                                        <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                                    </>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Issue Category</label>
                                    <select
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="PWD">PWD</option>
                                        <option value="Sanitation">Sanitation</option>
                                        <option value="Water Supply">Water Supply</option>
                                        <option value="Electricity">Electricity</option>
                                        <option value="Drainage">Drainage</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Description</label>
                                    <textarea
                                        required
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[100px]"
                                        placeholder="Briefly describe the issue..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="flex items-start gap-2 text-primary-600 text-sm font-bold bg-primary-50 p-3 rounded-xl">
                                    <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                                    <span className="break-words">{location.address}</span>
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

