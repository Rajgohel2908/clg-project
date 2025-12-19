import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { swapService } from '../services/swapService';
import Layout from '../layouts/Layout';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const SwapDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [swap, setSwap] = useState(null);
    const [loading, setLoading] = useState(true);

    const currentUserId = user ? (user._id || user.id) : null;

    useEffect(() => {
        const fetchSwap = async () => {
            try {
                setLoading(true);
                const data = await swapService.getSwapDetails(id);
                setSwap(data);
            } catch (error) {
                console.error('Error fetching swap details:', error);
                toast.error('Failed to load swap details');
            } finally {
                setLoading(false);
            }
        };
        fetchSwap();
    }, [id]);

    const handleAccept = async () => {
        try {
            await swapService.acceptSwap(id);
            toast.success('Swap accepted successfully!');
            setSwap(prev => ({ ...prev, status: 'accepted' }));
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to accept swap');
        }
    };

    const handleReject = async () => {
        if (!window.confirm("Are you sure you want to reject this request?")) return;
        try {
            await swapService.rejectSwap(id);
            toast.success('Swap rejected');
            setSwap(prev => ({ ...prev, status: 'rejected' }));
        } catch (error) {
            console.error(error);
            toast.error('Failed to reject swap');
        }
    };

    const handleCancel = async () => {
        if (!window.confirm("Are you sure you want to cancel this request?")) return;
        try {
            await api.delete(`/swaps/${id}`);
            toast.success('Request cancelled');
            navigate('/swaps'); // Redirect back to list
        } catch (error) {
            console.error(error);
            toast.error('Failed to cancel request');
        }
    };

    const getImageUrl = (img) => {
        if (!img) return 'https://via.placeholder.com/150';
        return img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`;
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </Layout>
        );
    }

    if (!swap) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Swap not found</h2>
                </div>
            </Layout>
        );
    }

    // Determine roles
    const requesterId = swap.requester?._id || swap.requester;
    const isRequester = requesterId === currentUserId;

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-green-600 transition-colors mb-6"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Swaps
                </button>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Swap Details</h1>

                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    {/* Header Status */}
                    <div className={`p-6 text-center ${swap.status === 'pending' ? 'bg-yellow-50 text-yellow-800' :
                            swap.status === 'accepted' ? 'bg-green-50 text-green-800' :
                                swap.status === 'completed' ? 'bg-blue-50 text-blue-800' :
                                    'bg-red-50 text-red-800'
                        }`}>
                        <p className="font-bold text-lg uppercase tracking-wide">Status: {swap.status}</p>
                        {swap.status === 'accepted' && (
                            <p className="text-sm mt-1">Contact the other party to arrange the exchange.</p>
                        )}
                        {swap.status === 'rejected' && swap.swapType === 'points' && (
                            <p className="text-sm mt-1">Points have been refunded to the requester.</p>
                        )}
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
                            {/* Requested Item */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 h-full flex flex-col">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Item Requested (By {swap.requester?.name})</h2>
                                <div className="aspect-square bg-white rounded-xl overflow-hidden mb-4 border border-gray-200">
                                    <img
                                        src={getImageUrl(swap.itemRequested?.images?.[0])}
                                        alt={swap.itemRequested?.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{swap.itemRequested?.title}</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-3">Owner: {swap.itemRequested?.owner?.name}</p>
                                <p className="text-gray-600 leading-relaxed">{swap.itemRequested?.description}</p>
                                <div className="mt-auto pt-4 flex gap-2">
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                                        {swap.itemRequested?.pointsValue} Points
                                    </span>
                                </div>
                            </div>

                            {/* Center Icon */}
                            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center border border-gray-100">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                            </div>

                            {/* Offered Item OR Points */}
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 h-full flex flex-col">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Offer Details</h2>

                                {swap.swapType === 'points' ? (
                                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-4xl mb-6 shadow-sm border-4 border-white">P</div>
                                        <h3 className="text-3xl font-bold text-gray-900">{swap.pointsValue} Points</h3>
                                        <p className="text-green-600 font-medium uppercase tracking-wide mt-2">Karma Credits</p>
                                        <p className="text-gray-500 text-sm mt-4 max-w-xs">
                                            Points {swap.status === 'pending' ? 'will be' : 'have been'} transferred from {swap.requester?.name}.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="aspect-square bg-white rounded-xl overflow-hidden mb-4 border border-gray-200">
                                            <img
                                                src={getImageUrl(swap.itemOffered?.images?.[0])}
                                                alt={swap.itemOffered?.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{swap.itemOffered?.title}</h3>
                                        <p className="text-gray-600 leading-relaxed mt-2">{swap.itemOffered?.description}</p>
                                        <div className="mt-auto pt-4">
                                            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                                                {swap.itemOffered?.pointsValue} Points
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        {swap.status === 'pending' && (
                            <div className="mt-8 flex justify-end gap-4 border-t border-gray-100 pt-6">
                                {isRequester ? (
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                                    >
                                        Cancel Request
                                    </button>
                                ) : (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleReject}
                                            className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                                        >
                                            Reject Swap
                                        </button>
                                        <button
                                            onClick={handleAccept}
                                            className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all transform hover:scale-[1.02]"
                                        >
                                            Accept Swap
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SwapDetail;
