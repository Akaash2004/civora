import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api, { API_BASE_URL } from '../utils/api';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ArrowLeft, Clock, AlertCircle, CheckCircle2, XCircle, MapPin, User, Tag, Calendar, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const STATUS_STAGES = ['Pending', 'In Progress', 'Resolved'];

const ComplaintTracking = () => {
    const { id } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapContainerRef = useRef(null);
    const mapboxMap = useRef(null);

    useEffect(() => {
        fetchComplaintDetails();
    }, [id]);

    const fetchComplaintDetails = async () => {
        try {
            const { data } = await api.get(`/complaints/${id}`);
            setComplaint(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to load complaint details.');
        } finally {
            setLoading(false);
        }
    };

    // Initialize Mapbox when complaint data is loaded
    useEffect(() => {
        if (!complaint || !mapContainerRef.current || mapboxMap.current) return;

        const [lng, lat] = complaint.location?.coordinates ?? [0, 0];
        if (lat === 0 && lng === 0) return;

        try {
            mapboxMap.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/light-v11',
                center: [lng, lat],
                zoom: 14,
                interactive: false // Static map for detail view
            });

            // Add marker
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.width = '24px';
            el.style.height = '24px';
            el.style.backgroundColor = '#3b82f6';
            el.style.border = '3px solid #ffffff';
            el.style.borderRadius = '50%';
            el.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';

            new mapboxgl.Marker(el)
                .setLngLat([lng, lat])
                .addTo(mapboxMap.current);

            mapboxMap.current.on('load', () => mapboxMap.current.resize());
        } catch (err) {
            console.error('Mapbox initialization error:', err);
        }

        return () => {
            mapboxMap.current?.remove();
            mapboxMap.current = null;
        };
    }, [complaint]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
                </div>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
                        <p className="text-gray-500 mb-6">{error || 'Complaint not found'}</p>
                        <Link to="/dashboard" className="text-primary-600 font-bold hover:underline">
                            &larr; Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentStageIndex = STATUS_STAGES.indexOf(complaint.status);
    const imageUrl = complaint.imageUrl?.startsWith('http') ? complaint.imageUrl : `${API_BASE_URL}/${complaint.imageUrl}`;
    const proofUrl = complaint.resolutionProofUrl
        ? (complaint.resolutionProofUrl.startsWith('http') ? complaint.resolutionProofUrl : `${API_BASE_URL}/${complaint.resolutionProofUrl}`)
        : null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
                
                {/* Back Link */}
                <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-6 transition-colors">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Details & Map */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Main Info Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <Tag size={12} /> {complaint.category}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                                    complaint.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                                    complaint.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                    {complaint.priority} Priority
                                </span>
                            </div>
                            
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
                                {complaint.description}
                            </h1>
                            
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500 font-medium pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(complaint.createdAt).toLocaleDateString()}</div>
                                <div className="flex items-center gap-1.5"><User size={16} /> {complaint.citizen?.name || complaint.citizen?.phoneNumber || 'Citizen'}</div>
                                <div className="flex items-center gap-1.5"><MapPin size={16} /> {complaint.location?.address || 'Location Verified'}</div>
                            </div>

                            {/* Image Section */}
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Attached Image</h3>
                                {complaint.imageUrl ? (
                                    <div className="rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                                        <img src={imageUrl} alt="Complaint Issue" className="w-full h-auto max-h-[400px] object-contain" />
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                                        <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 font-medium">No image provided</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Map Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin size={16} className="text-primary-600" /> Precise Location
                            </h3>
                            <div 
                                ref={mapContainerRef} 
                                className="w-full h-[250px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200"
                            >
                                {(!complaint.location?.coordinates || (complaint.location.coordinates[0] === 0)) && (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                                        No valid coordinates available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tracking & Remarks */}
                    <div className="space-y-6">
                        
                        {/* Status Tracker */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-6">Resolution Progress</h3>
                            
                            <div className="relative">
                                {/* Vertical Line */}
                                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100 rounded-full"></div>
                                
                                <div className="space-y-8 relative">
                                    {STATUS_STAGES.map((stage, index) => {
                                        const isCompleted = currentStageIndex >= index;
                                        const isCurrent = currentStageIndex === index;
                                        const isRejected = complaint.status === 'Fake/Invalid';

                                        let Icon = isCompleted ? CheckCircle2 : Clock;
                                        let dotColor = isCompleted ? 'bg-primary-600 text-white' : 'bg-white text-gray-300 border-2 border-gray-200';
                                        let textColor = isCompleted ? 'text-gray-900' : 'text-gray-400';

                                        if (isRejected) {
                                            dotColor = 'bg-red-500 text-white';
                                            textColor = 'text-gray-400';
                                            Icon = XCircle;
                                        }

                                        return (
                                            <div key={stage} className="flex gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors ${dotColor}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <div className="pt-1">
                                                    <p className={`font-bold ${textColor}`}>{stage}</p>
                                                    {isCurrent && !isRejected && (
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {stage === 'Pending' && "Awaiting review by authorities."}
                                                            {stage === 'In Progress' && "Authorities are actively working on this."}
                                                            {stage === 'Resolved' && "Issue has been successfully fixed!"}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Handle Fake/Invalid Edge Case */}
                                    {complaint.status === 'Fake/Invalid' && (
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 bg-red-500 text-white">
                                                <AlertCircle size={16} />
                                            </div>
                                            <div className="pt-1">
                                                <p className="font-bold text-red-600">Fake/Invalid</p>
                                                <p className="text-sm text-gray-500 mt-1">This complaint was flagged as invalid or duplicate.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Authority Remarks Section */}
                            {(complaint.remarks || complaint.status !== 'Pending') && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">Authority Remarks</h3>
                                    {complaint.remarks ? (
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <p className="text-sm text-gray-700 italic">"{complaint.remarks}"</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 font-medium italic">No remarks provided yet.</p>
                                    )}
                                </div>
                            )}

                            {/* Resolution Proof Section */}
                            {proofUrl && (
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <ShieldCheck size={15} className="text-emerald-600" />
                                        Resolution Proof
                                    </h3>
                                    <div className="rounded-2xl overflow-hidden border-2 border-emerald-100 bg-emerald-50">
                                        <img
                                            src={proofUrl}
                                            alt="Resolution Proof"
                                            className="w-full h-auto max-h-64 object-cover"
                                        />
                                    </div>
                                    <p className="text-xs text-emerald-700 font-semibold mt-2 text-center">
                                        ✓ Official proof submitted by the department authority
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ComplaintTracking;
