import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import { MapPin, Calendar, Tag, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

// Status → colour mapping
const STATUS_CONFIG = {
    'Pending':       { color: '#f59e0b', fill: '#fbbf24', label: 'Pending',     Icon: Clock },
    'In Progress':   { color: '#3b82f6', fill: '#60a5fa', label: 'In Progress', Icon: AlertCircle },
    'Resolved':      { color: '#10b981', fill: '#34d399', label: 'Resolved',    Icon: CheckCircle2 },
    'Fake/Invalid':  { color: '#ef4444', fill: '#f87171', label: 'Fake/Invalid',Icon: XCircle },
};

const MapView = () => {
    const [complaints, setComplaints]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [activeFilters, setActiveFilters] = useState(
        Object.keys(STATUS_CONFIG).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );

    useEffect(() => {
        api.get('/complaints')
            .then(({ data }) => setComplaints(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleFilter = (status) =>
        setActiveFilters(prev => ({ ...prev, [status]: !prev[status] }));

    // Only plot complaints that have real coordinates
    const plottable = complaints.filter(c => {
        const [lng, lat] = c.location?.coordinates ?? [0, 0];
        return lat !== 0 || lng !== 0;
    });

    const visible = plottable.filter(c => activeFilters[c.status]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 pt-20 flex flex-col">
                {/* Page header */}
                <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                        <MapPin className="text-primary-600" size={28} />
                        Complaint Map
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Visualise all civic complaints on an interactive map.
                    </p>
                </div>

                {/* Stats bar */}
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(STATUS_CONFIG).map(([status, { color, label, Icon }]) => {
                            const count = plottable.filter(c => c.status === status).length;
                            return (
                                <button
                                    key={status}
                                    onClick={() => toggleFilter(status)}
                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-semibold text-left
                                        ${activeFilters[status]
                                            ? 'border-transparent shadow-md text-white'
                                            : 'border-gray-200 bg-white text-gray-400'}`}
                                    style={activeFilters[status] ? { backgroundColor: color } : {}}
                                >
                                    <Icon size={20} />
                                    <div>
                                        <p className="text-xs uppercase tracking-widest">{label}</p>
                                        <p className="text-2xl font-black leading-none">{count}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Map */}
                <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 max-w-7xl mx-auto w-full">
                    <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-200" style={{ height: '520px' }}>
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 font-medium">
                                Loading map data...
                            </div>
                        ) : (
                            <MapContainer
                                center={[20.5937, 78.9629]} // Default: centre of India
                                zoom={5}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {visible.map((complaint) => {
                                    const [lng, lat] = complaint.location.coordinates;
                                    const cfg = STATUS_CONFIG[complaint.status] ?? STATUS_CONFIG['Pending'];

                                    return (
                                        <CircleMarker
                                            key={complaint._id}
                                            center={[lat, lng]}
                                            radius={9}
                                            pathOptions={{
                                                color: cfg.color,
                                                fillColor: cfg.fill,
                                                fillOpacity: 0.9,
                                                weight: 2,
                                            }}
                                        >
                                            <Popup maxWidth={280}>
                                                <div className="text-sm space-y-2 p-1">
                                                    {/* Status badge */}
                                                    <span
                                                        className="inline-block px-2 py-0.5 rounded-full text-xs font-bold text-white"
                                                        style={{ backgroundColor: cfg.color }}
                                                    >
                                                        {complaint.status}
                                                    </span>

                                                    {/* Category */}
                                                    <p className="flex items-center gap-1 text-gray-500 text-xs font-semibold uppercase tracking-widest">
                                                        <Tag size={12} />
                                                        {complaint.category}
                                                    </p>

                                                    {/* Description */}
                                                    <p className="font-semibold text-gray-900 line-clamp-2 leading-snug">
                                                        {complaint.description}
                                                    </p>

                                                    {/* Address */}
                                                    <p className="flex items-start gap-1 text-gray-500 text-xs leading-snug">
                                                        <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                                                        {complaint.location?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
                                                    </p>

                                                    {/* Date */}
                                                    <p className="flex items-center gap-1 text-gray-400 text-xs">
                                                        <Calendar size={12} />
                                                        {new Date(complaint.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </Popup>
                                        </CircleMarker>
                                    );
                                })}
                            </MapContainer>
                        )}
                    </div>

                    {/* Empty state */}
                    {!loading && visible.length === 0 && (
                        <p className="text-center text-gray-400 mt-6 font-medium">
                            No complaints match the selected filters, or no location data available.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MapView;
