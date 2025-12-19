import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { notificationService } from '../services/notificationService';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { getRelativeTime } from '../utils/timeUtils';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((notif) => (notif._id === id ? { ...notif, read: true } : notif))
            );
        } catch (error) {
            console.error(error);
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error(error);
            toast.error('Failed to mark all as read');
        }
    };

    const getImageUrl = (img) => {
        if (!img) return null;
        return img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`;
    };

    // Using shared getRelativeTime utility from utils/timeUtils.js

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <Layout>
            <div className="bg-gray-50 min-h-screen relative overflow-hidden">
                {/* Animated Water Drop Background */}
                <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 90, 0],
                            x: [0, 50, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-green-200/40 rounded-full blur-3xl mix-blend-multiply filter"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            rotate: [0, -60, 0],
                            x: [0, -50, 0],
                            y: [0, -50, 0],
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl mix-blend-multiply filter"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            x: [0, 30, 0],
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                        className="absolute -bottom-[20%] left-[10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl mix-blend-multiply filter"
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900">Notifications</h1>
                                <p className="text-gray-600 mt-2">
                                    {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                </p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="px-4 py-2 bg-white/60 backdrop-blur-lg border border-white/50 rounded-xl text-green-700 font-medium hover:bg-white shadow-sm transition-all"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h3>
                                <p className="text-gray-600">We'll notify you when something important happens.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((notification) => (
                                    <motion.div
                                        key={notification._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                                        className={`bg-white/60 backdrop-blur-lg rounded-2xl shadow-sm hover:shadow-xl transition-all border border-white/50 p-6 cursor-pointer ${!notification.read ? 'border-l-4 border-l-green-500' : ''
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            {/* Sender Avatar */}
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-lg font-bold text-white shadow-md flex-shrink-0">
                                                {notification.sender?.name?.charAt(0).toUpperCase() || 'S'}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div>
                                                        <p className="font-bold text-gray-900">{notification.sender?.name || 'System'}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                                    </div>
                                                    {!notification.read && (
                                                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0 mt-1"></div>
                                                    )}
                                                </div>

                                                {/* Item Preview */}
                                                {notification.relatedItem && (
                                                    <div className="mt-3 flex items-center gap-3 bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                                                        {notification.relatedItem.images && notification.relatedItem.images[0] && (
                                                            <img
                                                                src={getImageUrl(notification.relatedItem.images[0])}
                                                                alt={notification.relatedItem.title}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 truncate">{notification.relatedItem.title}</p>
                                                            <p className="text-xs text-green-600 font-bold">{notification.relatedItem.pointsValue} points</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Timestamp */}
                                                <p className="text-xs text-gray-400 mt-3">{getRelativeTime(notification.createdAt)}</p>

                                                {/* Action Link for swap requests */}
                                                {notification.type === 'swap_request' && notification.relatedSwap && (
                                                    <Link
                                                        to={`/swaps/${notification.relatedSwap?._id || notification.relatedSwap}`}
                                                        className="inline-block mt-3 text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                                                    >
                                                        View Swap Request →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default Notifications;
