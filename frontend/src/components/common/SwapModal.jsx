import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { itemService } from '../../services/itemService';
import { swapService } from '../../services/swapService';
import { useAuth } from '../../context/AuthContext';

const SwapModal = ({ isOpen, onClose, item }) => {
    const { user } = useAuth();
    const [swapType, setSwapType] = useState(null); // 'points' or 'item'
    const [myItems, setMyItems] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);

    useEffect(() => {
        if (isOpen && swapType === 'item') {
            fetchMyItems();
        }
    }, [isOpen, swapType]);

    const fetchMyItems = async () => {
        setLoadingItems(true);
        try {
            const items = await itemService.getMyItems();
            // Filter: approved/available items with matching point value (exact match)
            const matchingItems = items.filter(
                (i) =>
                    ['approved', 'available'].includes(i.status) &&
                    i._id !== item._id &&
                    i.pointsValue === item.pointsValue
            );
            setMyItems(matchingItems);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load your items');
        } finally {
            setLoadingItems(false);
        }
    };

    const handleConfirm = async () => {
        if (!swapType) {
            toast.error('Please select a swap method');
            return;
        }

        if (swapType === 'item' && !selectedItemId) {
            toast.error('Please select an item to exchange');
            return;
        }

        setLoading(true);
        try {
            const swapData = {
                swapType,
                ownerId: item.uploader?._id || item.owner?._id,
                itemRequestedId: item._id,
            };

            if (swapType === 'item') {
                swapData.itemOfferedId = selectedItemId;
            }

            await swapService.createSwap(swapData);
            toast.success('Swap request sent successfully!');
            onClose();
            setSwapType(null);
            setSelectedItemId(null);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to send swap request');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSwapType(null);
        setSelectedItemId(null);
        onClose();
    };

    const getImageUrl = (img) => {
        if (!img) return 'https://via.placeholder.com/100x100?text=No+Image';
        return img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`;
    };

    const insufficientPoints = user && user.points < item.pointsValue;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/50"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Request Swap</h3>
                                    <p className="text-sm text-gray-600 mt-1">Choose how you'd like to swap for <strong>{item.title}</strong></p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Swap Type Selection */}
                            <div className="space-y-4 mb-6">
                                {/* Points Option */}
                                <div
                                    onClick={() => !insufficientPoints && setSwapType('points')}
                                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${swapType === 'points'
                                            ? 'border-green-500 bg-green-50/50 shadow-md'
                                            : insufficientPoints
                                                ? 'border-gray-200 bg-gray-100/50 cursor-not-allowed opacity-60'
                                                : 'border-gray-200 bg-white/60 backdrop-blur-sm hover:border-green-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${swapType === 'points' ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'
                                                }`}
                                        >
                                            {swapType === 'points' && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900 mb-1">Swap with Points</h4>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Use your karma points to request this item. Points will be transferred to the owner upon acceptance.
                                            </p>
                                            <div className="flex items-baseline gap-3 bg-white/80 rounded-xl px-4 py-3 border border-gray-100">
                                                <div>
                                                    <span className="text-xs font-medium text-gray-500 uppercase">Your Points</span>
                                                    <p className="text-2xl font-bold text-gray-900">{user?.points || 0}</p>
                                                </div>
                                                <div className="text-gray-400">→</div>
                                                <div>
                                                    <span className="text-xs font-medium text-gray-500 uppercase">Item Cost</span>
                                                    <p className="text-2xl font-bold text-green-600">{item.pointsValue}</p>
                                                </div>
                                            </div>
                                            {insufficientPoints && (
                                                <p className="text-sm text-red-500 font-medium mt-2">
                                                    ⚠️ Insufficient points. You need {item.pointsValue - (user?.points || 0)} more points.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Item Exchange Option */}
                                <div
                                    onClick={() => setSwapType('item')}
                                    className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${swapType === 'item'
                                            ? 'border-green-500 bg-green-50/50 shadow-md'
                                            : 'border-gray-200 bg-white/60 backdrop-blur-sm hover:border-green-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${swapType === 'item' ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'
                                                }`}
                                        >
                                            {swapType === 'item' && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900 mb-1">Exchange Item</h4>
                                            <p className="text-sm text-gray-600 mb-3">
                                                Trade one of your items with the same point value ({item.pointsValue} points).
                                            </p>

                                            {swapType === 'item' && (
                                                <div className="mt-4">
                                                    {loadingItems ? (
                                                        <div className="flex justify-center py-6">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                                        </div>
                                                    ) : myItems.length === 0 ? (
                                                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                                                            <p className="text-amber-800 font-medium mb-2">
                                                                No matching items found
                                                            </p>
                                                            <p className="text-sm text-amber-600">
                                                                You don't have any approved items worth {item.pointsValue} points.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                                            {myItems.map((myItem) => (
                                                                <div
                                                                    key={myItem._id}
                                                                    onClick={() => setSelectedItemId(myItem._id)}
                                                                    className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedItemId === myItem._id
                                                                            ? 'border-green-500 bg-green-50'
                                                                            : 'border-gray-200 bg-white hover:border-green-300'
                                                                        }`}
                                                                >
                                                                    <img
                                                                        src={getImageUrl(myItem.images?.[0])}
                                                                        alt={myItem.title}
                                                                        className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                                                    />
                                                                    <div className="flex-1">
                                                                        <h5 className="font-bold text-gray-900">{myItem.title}</h5>
                                                                        <p className="text-xs text-gray-500">
                                                                            {myItem.condition} • {myItem.brand || 'No Brand'}
                                                                        </p>
                                                                        <p className="text-xs font-bold text-green-600 mt-1">{myItem.pointsValue} points</p>
                                                                    </div>
                                                                    {selectedItemId === myItem._id && (
                                                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/80">
                            <button
                                onClick={handleClose}
                                className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!swapType || (swapType === 'item' && !selectedItemId) || loading || insufficientPoints}
                                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Sending...' : 'Confirm Swap Request'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SwapModal;
