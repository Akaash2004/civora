import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import api from '../utils/api';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Calendar, Tag, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
    'Pending':      { color: '#f59e0b', label: 'Pending',      Icon: Clock },
    'In Progress':  { color: '#3b82f6', label: 'In Progress',  Icon: AlertCircle },
    'Resolved':     { color: '#10b981', label: 'Resolved',     Icon: CheckCircle2 },
    'Fake/Invalid': { color: '#ef4444', label: 'Fake/Invalid', Icon: XCircle },
};

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapView = () => {
    const [complaints, setComplaints]       = useState([]);
    const [loading, setLoading]             = useState(true);
    const [error, setError]                 = useState(null);
    const [activeFilters, setActiveFilters] = useState(
        Object.keys(STATUS_CONFIG).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    );
    const mapContainerRef = useRef(null); // DOM node
    const mapboxMap = useRef(null); // Mapbox map instance
    const markersRef = useRef([]);   // track current markers

    // ── Fetch complaints ─────────────────────────────────────────
    useEffect(() => {
        api.get('/complaints')
            .then(({ data }) => setComplaints(data))
            .catch((err) => setError(err.message || 'Failed to load complaints'))
            .finally(() => setLoading(false));
    }, []);

    // ── Initialise Mapbox map once ────────────────────────────────
    useEffect(() => {
        if (!mapContainerRef.current || mapboxMap.current) return;

        try {
            mapboxMap.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/light-v11',
                center: [80.2707, 13.0827], // Note Mapbox uses [lng, lat]
                zoom: 12
            });

            mapboxMap.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        } catch (err) {
            setError('Mapbox library failed to load or initialize.');
        }

        return () => {
            mapboxMap.current?.remove();
            mapboxMap.current = null;
        };
    }, []);

    // ── Re-draw markers whenever complaints or filters change ──────
    useEffect(() => {
        const map = mapboxMap.current;
        if (!map) return;

        // Clear old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        complaints.forEach((c) => {
            if (!activeFilters[c.status]) return;
            const [lng, lat] = c.location?.coordinates ?? [0, 0];
            if (lat === 0 && lng === 0) return; // skip no-location complaints

            const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG['Pending'];

            // Create custom marker DOM element
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.width = '18px';
            el.style.height = '18px';
            el.style.backgroundColor = cfg.color;
            el.style.border = '2px solid #ffffff';
            el.style.borderRadius = '50%';
            el.style.opacity = '0.9';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

            const address = c.location?.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            const date    = new Date(c.createdAt).toLocaleDateString();

            const popup = new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(`
                <div style="font-family:sans-serif;font-size:13px;line-height:1.5;min-width:200px;padding:4px">
                    <span style="background:${cfg.color};color:#fff;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700">
                        ${c.status}
                    </span>
                    <p style="color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin:6px 0 2px">
                        ${c.category}
                    </p>
                    <p style="font-weight:600;color:#111827;margin:0 0 6px">
                        ${c.description.length > 80 ? c.description.slice(0, 80) + '…' : c.description}
                    </p>
                    <p style="color:#9ca3af;font-size:11px;margin:0">📍 ${address}</p>
                    <p style="color:#9ca3af;font-size:11px;margin:4px 0 0">📅 ${date} • 👍 ${c.votes?.length || 0} Votes</p>
                </div>
            `);

            const marker = new mapboxgl.Marker(el)
                .setLngLat([lng, lat])
                .setPopup(popup)
                .addTo(map);

            markersRef.current.push(marker);
        });
    }, [complaints, activeFilters]);

    const toggleFilter = (status) =>
        setActiveFilters(prev => ({ ...prev, [status]: !prev[status] }));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="pt-20 pb-10 flex-1 flex flex-col">

                {/* Header */}
                <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
                        <MapPin className="text-primary-600" size={28} />
                        Complaint Map
                    </h1>
                    <p className="text-gray-500 mt-1">Visualise all civic complaints on an interactive map.</p>
                </div>

                {/* Stat / filter cards */}
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {Object.entries(STATUS_CONFIG).map(([status, { color, label, Icon }]) => {
                            const count = complaints.filter(c => c.status === status).length;
                            return (
                                <button
                                    key={status}
                                    onClick={() => toggleFilter(status)}
                                    className="flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-semibold text-left"
                                    style={activeFilters[status]
                                        ? { backgroundColor: color, borderColor: color, color: '#fff' }
                                        : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#9ca3af' }}
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

                {/* Map container */}
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-1">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center font-medium mb-4">
                            {error}
                        </div>
                    )}
                    {loading && (
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 font-medium"
                            style={{ height: 520 }}>
                            Loading map data…
                        </div>
                    )}
                    <div
                        ref={mapContainerRef}
                        style={{ height: 520, borderRadius: '1.5rem', overflow: 'hidden', display: loading ? 'none' : 'block' }}
                        className="shadow-lg border border-gray-200"
                    />
                    {!loading && markersRef.current.length === 0 && !error && (
                        <p className="text-center text-gray-400 mt-4 font-medium">
                            No complaints with location data found.
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MapView;
