import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api, { API_BASE_URL } from '../utils/api';
import {
    Users, Shield, BarChart3, CheckCircle2, AlertTriangle,
    Trash2, Plus, ChevronDown, Search, X, Clock, Loader2,
    MapPin, Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEPARTMENTS = ['PWD', 'Sanitation', 'Water Supply', 'Electricity', 'Drainage'];
const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved', 'Fake/Invalid'];

// ─── Reusable Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${colorClass}`}>
            <Icon size={22} />
        </div>
        <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-black text-gray-900">
                {value ?? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" />}
            </p>
        </div>
    </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const map = {
        'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
        'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
        'Resolved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'Fake/Invalid': 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {status}
        </span>
    );
};

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
        >
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 text-center mb-2">Are you sure?</h3>
            <p className="text-gray-500 text-center text-sm mb-6">{message}</p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all">
                    Cancel
                </button>
                <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">
                    Delete
                </button>
            </div>
        </motion.div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'users' | 'create'

    // Create Authority form state
    const [form, setForm] = useState({ uniqueId: '', password: '', department: DEPARTMENTS[0] });
    const [formLoading, setFormLoading] = useState(false);
    const [formMsg, setFormMsg] = useState(null); // { type: 'success'|'error', text }

    // Search / filter
    const [userSearch, setUserSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Inline remark state for complaint update
    const [remarkInputs, setRemarkInputs] = useState({}); // { [complaintId]: string }

    // Confirm modal
    const [confirmModal, setConfirmModal] = useState(null); // { message, onConfirm }

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, complaintsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/complaints'),
            ]);
            setStats(statsRes.data);
            setUsers(usersRes.data);
            setComplaints(complaintsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ── Create Authority ────────────────────────────────────────────────────
    const handleCreateAuthority = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setFormMsg(null);
        try {
            await api.post('/auth/register-authority', form);
            setFormMsg({ type: 'success', text: `Authority account "${form.uniqueId}" created successfully!` });
            setForm({ uniqueId: '', password: '', department: DEPARTMENTS[0] });
            fetchAll(); // Refresh stats + users
        } catch (err) {
            setFormMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create account.' });
        } finally {
            setFormLoading(false);
        }
    };

    // ── Delete User ─────────────────────────────────────────────────────────
    const handleDeleteUser = (userId, identifier) => {
        setConfirmModal({
            message: `This will permanently delete the account for "${identifier}". This action cannot be undone.`,
            onConfirm: async () => {
                setConfirmModal(null);
                try {
                    await api.delete(`/admin/users/${userId}`);
                    setUsers(prev => prev.filter(u => u._id !== userId));
                    setStats(prev => ({
                        ...prev,
                        citizens: prev.citizens - (users.find(u => u._id === userId)?.role === 'citizen' ? 1 : 0),
                        authorities: prev.authorities - (users.find(u => u._id === userId)?.role === 'authority' ? 1 : 0),
                    }));
                } catch (err) { console.error(err); }
            }
        });
    };

    // ── Update Complaint Status ─────────────────────────────────────────────
    const handleUpdateStatus = async (id, status) => {
        const remarks = remarkInputs[id] || '';
        try {
            await api.patch(`/complaints/${id}`, { status, remarks });
            setComplaints(prev => prev.map(c => c._id === id ? { ...c, status, remarks: remarks || c.remarks } : c));
            setRemarkInputs(prev => ({ ...prev, [id]: '' }));
        } catch (err) { console.error(err); }
    };

    // ── Delete Complaint ────────────────────────────────────────────────────
    const handleDeleteComplaint = (complaintId) => {
        setConfirmModal({
            message: `This will permanently remove this complaint from the system. This is irreversible.`,
            onConfirm: async () => {
                setConfirmModal(null);
                try {
                    await api.delete(`/admin/complaints/${complaintId}`);
                    setComplaints(prev => prev.filter(c => c._id !== complaintId));
                    fetchAll(); // Refresh stats
                } catch (err) { console.error(err); }
            }
        });
    };

    // ── Derived lists ───────────────────────────────────────────────────────
    const filteredUsers = users.filter(u => {
        const term = userSearch.toLowerCase();
        return (u.phoneNumber || u.uniqueId || '').toLowerCase().includes(term) ||
            (u.department || '').toLowerCase().includes(term);
    });

    const filteredComplaints = statusFilter === 'All'
        ? complaints
        : complaints.filter(c => c.status === statusFilter);

    // ── TABS ────────────────────────────────────────────────────────────────
    const TABS = [
        { id: 'complaints', label: 'All Complaints', count: complaints.length },
        { id: 'users', label: 'Manage Users', count: users.length },
        { id: 'create', label: 'Create Authority', count: null },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {confirmModal && (
                <ConfirmModal
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal(null)}
                />
            )}

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">System Administration</h1>
                    <p className="text-gray-500 font-medium mt-1">Full system visibility and control.</p>
                </div>

                {/* ─── Stat Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    <StatCard icon={Users}        label="Citizens"       value={stats?.citizens}           colorClass="bg-blue-100 text-blue-600" />
                    <StatCard icon={Shield}       label="Authorities"    value={stats?.authorities}         colorClass="bg-violet-100 text-violet-600" />
                    <StatCard icon={BarChart3}    label="Total Complaints" value={stats?.totalComplaints}   colorClass="bg-amber-100 text-amber-600" />
                    <StatCard icon={CheckCircle2} label="Resolved"       value={stats?.resolvedComplaints}  colorClass="bg-emerald-100 text-emerald-600" />
                </div>

                {/* ─── Tabs ────────────────────────────────────────────────── */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit mb-8">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== null && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">

                    {/* ═══════════════ ALL COMPLAINTS TAB ════════════════════ */}
                    {activeTab === 'complaints' && (
                        <motion.div key="complaints" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            {/* Filter bar */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {['All', ...STATUS_OPTIONS].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                                            statusFilter === s
                                                ? 'bg-gray-900 text-white border-gray-900'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
                            ) : filteredComplaints.length === 0 ? (
                                <div className="text-center py-16 text-gray-400 font-medium">No complaints found.</div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredComplaints.map(complaint => (
                                        <motion.div
                                            key={complaint._id}
                                            layout
                                            className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col lg:flex-row gap-6"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img
                                                    src={complaint.imageUrl?.startsWith('http') ? complaint.imageUrl : `${API_BASE_URL}/${complaint.imageUrl}`}
                                                    alt="Complaint"
                                                    className="w-full h-full object-cover"
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <StatusBadge status={complaint.status} />
                                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                                        <Tag size={10} /> {complaint.department || complaint.category}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                                        complaint.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                        complaint.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {complaint.priority} Priority
                                                    </span>
                                                </div>
                                                <p className="font-bold text-gray-900 text-lg leading-snug truncate">{complaint.description}</p>
                                                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1"><MapPin size={11} /> {complaint.location?.address || 'Unknown'}</span>
                                                    <span className="flex items-center gap-1"><Users size={11} /> {complaint.citizen?.phoneNumber || complaint.citizen?.uniqueId || 'Citizen'}</span>
                                                    <span className="flex items-center gap-1"><Clock size={11} /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                                    <span>• {complaint.votes?.length || 0} Votes</span>
                                                </div>
                                                {complaint.remarks && (
                                                    <p className="mt-2 text-xs text-gray-500 italic bg-gray-50 rounded-lg px-3 py-2">
                                                        💬 "{complaint.remarks}"
                                                    </p>
                                                )}

                                                {/* Remark input */}
                                                <div className="mt-3 flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={remarkInputs[complaint._id] || ''}
                                                        onChange={e => setRemarkInputs(prev => ({ ...prev, [complaint._id]: e.target.value }))}
                                                        placeholder="Add / update remark (optional)..."
                                                        className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 bg-gray-50"
                                                    />
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 min-w-[160px]">
                                                {/* Status update buttons */}
                                                {complaint.status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(complaint._id, 'In Progress')}
                                                        className="px-4 py-2.5 border border-blue-200 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all"
                                                    >
                                                        Start Working
                                                    </button>
                                                )}
                                                {complaint.status === 'In Progress' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(complaint._id, 'Resolved')}
                                                        className="px-4 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition-all"
                                                    >
                                                        Mark Resolved
                                                    </button>
                                                )}
                                                {complaint.status !== 'Fake/Invalid' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(complaint._id, 'Fake/Invalid')}
                                                        className="px-4 py-2.5 border border-amber-200 text-amber-600 font-bold text-sm rounded-xl hover:bg-amber-50 transition-all"
                                                    >
                                                        Mark Fake
                                                    </button>
                                                )}

                                                {/* Delete — highlighted for fake complaints */}
                                                <button
                                                    onClick={() => handleDeleteComplaint(complaint._id)}
                                                    className={`px-4 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                                                        complaint.status === 'Fake/Invalid'
                                                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
                                                            : 'border border-red-200 text-red-500 hover:bg-red-50'
                                                    }`}
                                                >
                                                    <Trash2 size={14} /> Delete Complaint
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ═══════════════ MANAGE USERS TAB ══════════════════════ */}
                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            {/* Search */}
                            <div className="relative mb-6 max-w-md">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    placeholder="Search by phone, ID, or department..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400 bg-white font-medium text-sm"
                                />
                                {userSearch && (
                                    <button onClick={() => setUserSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
                            ) : (
                                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Identifier</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Department</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Joined</th>
                                                <th className="px-6 py-4"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map(user => (
                                                <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-gray-900">
                                                        {user.phoneNumber || user.uniqueId || '—'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                            user.role === 'authority'
                                                                ? 'bg-violet-100 text-violet-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 font-medium">{user.department || '—'}</td>
                                                    <td className="px-6 py-4 text-gray-400 font-medium">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => handleDeleteUser(user._id, user.phoneNumber || user.uniqueId)}
                                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                            title="Delete user"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-12 text-gray-400 font-medium">No users found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ═══════════════ CREATE AUTHORITY TAB ══════════════════ */}
                    {activeTab === 'create' && (
                        <motion.div key="create" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="max-w-lg"
                        >
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
                                        <Shield size={20} className="text-violet-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900">Create Authority Account</h2>
                                        <p className="text-sm text-gray-500">Assign a new department officer</p>
                                    </div>
                                </div>

                                <form onSubmit={handleCreateAuthority} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Unique ID</label>
                                        <input
                                            type="text"
                                            value={form.uniqueId}
                                            onChange={e => setForm(p => ({ ...p, uniqueId: e.target.value }))}
                                            required
                                            placeholder="e.g. PWD-2024-001"
                                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                                        <input
                                            type="password"
                                            value={form.password}
                                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                            required
                                            placeholder="Set a secure password"
                                            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-blue-400"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Department</label>
                                        <div className="relative">
                                            <select
                                                value={form.department}
                                                onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm font-medium appearance-none focus:outline-none focus:border-blue-400 bg-white cursor-pointer"
                                            >
                                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {formMsg && (
                                        <div className={`px-4 py-3 rounded-2xl text-sm font-bold ${formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                            {formMsg.text}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {formLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                        {formLoading ? 'Creating...' : 'Create Authority Account'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDashboard;
