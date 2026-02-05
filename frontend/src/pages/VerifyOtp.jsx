import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyOtp = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const phoneNumber = location.state?.phoneNumber;

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/verify-otp', { phoneNumber, otp });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100"
            >
                <div>
                    <div className="flex justify-center">
                        <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
                            <Smartphone size={40} />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                        Verify Phone
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Enter the 6-digit code sent to <strong>{phoneNumber}</strong>
                    </p>
                    <p className="mt-1 text-center text-xs text-blue-500 font-medium bg-blue-50 inline-block px-2 py-1 rounded w-full">
                        Internal Test Mode: Use OTP 123456
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleVerify}>
                    <div className="relative">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Verification Code</label>
                        <input
                            type="text"
                            required
                            maxLength="6"
                            className="block w-full px-3 py-4 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-2xl font-bold tracking-[1em] transition-all shadow-sm"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                            {!loading && <ArrowRight className="ml-2" size={18} />}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default VerifyOtp;
