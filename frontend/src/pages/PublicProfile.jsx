import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../layouts/Layout';
import ItemCard from '../components/common/ItemCard';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

const PublicProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await userService.getUserPublicProfile(userId);
            setProfileData(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load user profile');
            // Navigate back if user not found
            if (error.response?.status === 404) {
                setTimeout(() => navigate('/leaderboard'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
                </div>
            </Layout>
        );
    }

    if (!profileData) {
        return (
            <Layout>
                <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl mb-4">😕</div>
                        <p className="text-gray-600 text-xl font-medium">User not found</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const { user, items } = profileData;

    // Format join date
    const formatJoinDate = (date) => {
        const options = { year: 'numeric', month: 'long' };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 inline-flex items-center gap-2 px-3 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 hover:border-gray-300 hover:bg-white/70 shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-gray-900 text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* User Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-12"
                    >
                        <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-gray-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
                            {/* Decorative gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-blue-400/10 to-purple-400/10 rounded-3xl"></div>

                            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                                {/* Avatar */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
                                    className="flex-shrink-0"
                                >
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 flex items-center justify-center text-white text-6xl font-black ring-8 ring-white shadow-2xl">
                                        {user.avatar}
                                    </div>
                                </motion.div>

                                {/* User Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <motion.h1
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                        className="text-4xl md:text-5xl font-black text-gray-800 mb-3"
                                    >
                                        {user.name}
                                    </motion.h1>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6"
                                    >
                                        {/* Join Date */}
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-gray-200">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span className="text-sm font-semibold text-gray-600">
                                                Joined {formatJoinDate(user.joinDate)}
                                            </span>
                                        </div>

                                        {/* Points Badge */}
                                        <div className="px-5 py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full shadow-lg">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">⭐</span>
                                                <div className="text-left">
                                                    <div className="text-xs font-semibold text-white/80 leading-none">Total Points</div>
                                                    <div className="text-xl font-black text-white leading-tight">{user.karma}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Stats */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.5 }}
                                        className="flex flex-wrap items-center justify-center md:justify-start gap-6"
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl font-black text-gray-800">{items.length}</div>
                                            <div className="text-sm font-semibold text-gray-500">Available Items</div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Items Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <div className="mb-6">
                            <h2 className="text-3xl font-black text-gray-800 mb-2">Available Items</h2>
                            <p className="text-gray-600 font-medium">Browse items listed by {user.name}</p>
                        </div>

                        {items.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {items.map((item, index) => (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                                    >
                                        <ItemCard item={item} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                className="text-center py-20"
                            >
                                <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-12 border border-gray-200/50 max-w-md mx-auto">
                                    <div className="text-6xl mb-4">📦</div>
                                    <p className="text-gray-600 text-lg font-medium">
                                        No items available at the moment
                                    </p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        Check back later for new listings!
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="mt-12 text-center"
                    >
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-lg rounded-full border border-gray-200 hover:border-green-400 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold text-gray-700 hover:text-green-600"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Top Contributors
                        </button>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default PublicProfile;
