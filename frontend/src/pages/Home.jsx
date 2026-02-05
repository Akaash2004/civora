import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Shield, MessageSquare, MapPin, Zap, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-widest text-primary-600 uppercase bg-primary-50 rounded-full">
                            Smart Civic Solutions
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-8">
                            Empowering Cities <br />
                            <span className="text-primary-600">Improving Lives.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-500 font-medium mb-10 leading-relaxed">
                            CIVORA is a smart civic complaint platform that enables citizens to report issues easily
                            while helping authorities resolve them efficiently.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-10 py-5 bg-black text-white text-lg font-bold rounded-2xl shadow-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                Get Started
                                <ArrowRight size={20} />
                            </Link>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 text-lg font-bold rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all"
                            >
                                Sign In
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats / Proof Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <h3 className="text-5xl font-black text-gray-900 mb-2">1,200+</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Issues Resolved</p>
                        </div>
                        <div>
                            <h3 className="text-5xl font-black text-primary-600 mb-2">98%</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Citizen Satisfaction</p>
                        </div>
                        <div>
                            <h3 className="text-5xl font-black text-gray-900 mb-2">24h</h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Avg. Response Time</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-32 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
                            Designed for modern <br /> governance.
                        </h2>
                        <div className="h-2 w-20 bg-primary-600 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <MessageSquare className="text-primary-600" size={32} />,
                                title: "Quick Reporting",
                                desc: "Snap a photo, add a description, and report any civic issue in seconds."
                            },
                            {
                                icon: <MapPin className="text-emerald-600" size={32} />,
                                title: "GPS Tracking",
                                desc: "Automatic location detection ensures authorities know exactly where the issue is."
                            },
                            {
                                icon: <Zap className="text-amber-600" size={32} />,
                                title: "AI Categorization",
                                desc: "Our AI automatically routes your complaint to the right department for faster action."
                            },
                            {
                                icon: <Shield className="text-purple-600" size={32} />,
                                title: "Verified Updates",
                                desc: "Get real-time updates as your complaint moves from pending to resolved."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                                <div className="mb-6 p-4 bg-gray-50 inline-block rounded-2xl group-hover:bg-white transition-colors">
                                    {feature.icon}
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                                <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                            <Shield className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter">CIVORA</span>
                    </div>
                    <p className="text-gray-400 font-medium">© 2026 CIVORA Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
