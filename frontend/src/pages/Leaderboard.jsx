import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../layouts/Layout';
import { userService } from '../services/userService';
import toast from 'react-hot-toast';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const data = await userService.getLeaderboard();
            setLeaderboard(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            toast.error('Failed to load top contributors');
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (userId) => {
        navigate(`/user/${userId}`);
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Top Contributors
                        </h1>
                        <p className="text-gray-600">
                            Recognizing our most active community members
                        </p>
                    </motion.div>

                    {/* Contributors List */}
                    {leaderboard.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="space-y-3"
                        >
                            {leaderboard.map((user, index) => (
                                <motion.div
                                    key={user._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                                    onClick={() => handleUserClick(user._id)}
                                    className="group relative cursor-pointer"
                                >
                                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200">
                                        <div className="flex items-center gap-4">
                                            {/* Rank */}
                                            <div className="flex-shrink-0 w-10 text-center">
                                                <span className="text-lg font-semibold text-gray-700">
                                                    #{user.rank}
                                                </span>
                                                {user.rank === 1 && (
                                                    <span className="ml-1 text-yellow-500">⭐</span>
                                                )}
                                            </div>

                                            {/* Avatar */}
                                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                                                {user.avatar}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                                                    {user.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {user.itemsCount} {user.itemsCount === 1 ? 'item' : 'items'} listed
                                                </p>
                                            </div>

                                            {/* Points Badge */}
                                            <div className="flex-shrink-0">
                                                <div className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-gray-900">
                                                            {user.karma}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-medium">
                                                            Points
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200"
                        >
                            <p className="text-gray-500 text-lg">No contributors yet</p>
                        </motion.div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Leaderboard;
