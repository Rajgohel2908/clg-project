import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../layouts/Layout';
import Button from '../components/ui/Button';
import { swapService } from '../services/swapService';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { getRelativeTime } from '../utils/timeUtils';

const Swaps = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // 👇 FIX: User ID ko sahi se pakadna (Refresh issue fix)
  const currentUserId = user ? (user._id || user.id) : null;

  useEffect(() => {
    if (user) {
      fetchSwaps();
    }
  }, [user]);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const data = await swapService.getMySwaps();
      setSwaps(data);
    } catch (error) {
      console.error('Error fetching swaps:', error);
      toast.error('Could not load swaps');
    } finally {
      setLoading(false);
    }
  };

  // Helper to fix image URLs
  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/100x100?text=No+Image';
    return img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`;
  };

  // --- ACTIONS ---

  const handleAcceptSwap = async (swapId) => {
    try {
      await swapService.acceptSwap(swapId);
      toast.success('Swap accepted!');
      fetchSwaps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept swap');
    }
  };

  const handleRejectSwap = async (swapId) => {
    if (!window.confirm("Reject this request?")) return;
    try {
      await swapService.rejectSwap(swapId);
      toast.success('Swap rejected');
      fetchSwaps();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject swap');
    }
  };

  const handleCompleteSwap = async (swapId) => {
    try {
      await swapService.completeSwap(swapId);
      toast.success('Swap completed!');
      fetchSwaps();
    } catch (error) {
      toast.error('Failed to complete swap');
    }
  };

  // 👇 CANCEL Function (Requester ke liye)
  const handleCancelSwap = async (swapId) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      // Backend me delete API call
      await api.delete(`/swaps/${swapId}`);
      toast.success('Request cancelled');
      setSwaps(prev => prev.filter(s => s._id !== swapId));
    } catch (error) {
      console.error(error);
      toast.error('Failed to cancel request');
    }
  };

  const filteredSwaps = swaps.filter(swap => {
    if (activeTab === 'all') return true;
    return (swap.status || '').toString().toLowerCase() === activeTab;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Swaps</h1>
            <p className="text-gray-600">Manage your swap requests and ongoing exchanges.</p>
          </div>

          {/* Tabs */}
          <div className="bg-white shadow-sm rounded-lg mb-6 overflow-x-auto">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6 min-w-max">
                {['all', 'pending', 'accepted', 'completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap transition-colors ${activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab} ({swaps.filter(s => tab === 'all' ? true : (s.status || '').toLowerCase() === tab).length})
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : filteredSwaps.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-12 text-center border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps found</h3>
              <p className="text-gray-600">No {activeTab} swaps found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSwaps.map((swap) => {
                // 👇 MAIN LOGIC FIX: Identify if I am the Requester
                // Hame swap.requester object ho sakta hai ya string ID
                const requesterId = swap.requester?._id || swap.requester;
                const isRequester = requesterId === currentUserId;

                const myItem = isRequester ? swap.itemOffered : swap.itemRequested;
                const theirItem = isRequester ? swap.itemRequested : swap.itemOffered;

                return (
                  <div key={swap._id} className="bg-white/60 backdrop-blur-lg shadow-sm rounded-2xl p-4 border border-white/50 hover:shadow-xl transition-all">

                    {/* Compact Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-800">
                          {isRequester ? '📤 Outgoing' : '📥 Incoming'}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {swap.createdAt ? getRelativeTime(swap.createdAt) : 'Recently'}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${getStatusColor(swap.status)}`}>
                        {swap.status}
                      </span>
                    </div>

                    {/* Compact Horizontal Layout */}
                    <div className="flex items-center gap-3 mb-3 bg-gradient-to-r from-gray-50/50 to-transparent p-3 rounded-xl">
                      {/* My Item/Points */}
                      <div className="flex items-center gap-2 flex-1">
                        {swap.swapType === 'points' && isRequester ? (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm border-2 border-green-200 flex-shrink-0">
                              P
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-xs truncate">{swap.pointsValue} pts</p>
                              <p className="text-[9px] text-green-600 font-medium uppercase">You Offer</p>
                            </div>
                          </div>
                        ) : !isRequester && swap.swapType === 'points' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img
                                src={getImageUrl(theirItem?.images?.[0])}
                                alt="Item"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-xs truncate">{theirItem?.title || "Unknown"}</p>
                              <p className="text-[9px] text-gray-500 uppercase">You Give</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img
                                src={getImageUrl(myItem?.images?.[0])}
                                alt="Item"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-xs truncate">{myItem?.title || "Unknown"}</p>
                              <p className="text-[9px] text-gray-500 uppercase">{isRequester ? 'You Offer' : 'You Give'}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex-shrink-0 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>

                      {/* Their Item/Points */}
                      <div className="flex items-center gap-2 flex-1">
                        {swap.swapType === 'points' && !isRequester ? (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm border-2 border-green-200 flex-shrink-0">
                              P
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-xs truncate">{swap.pointsValue} pts</p>
                              <p className="text-[9px] text-green-600 font-medium uppercase">They Offer</p>
                            </div>
                          </div>
                        ) : isRequester && swap.swapType === 'points' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img
                                src={getImageUrl(theirItem?.images?.[0])}
                                alt="Item"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-xs truncate">{theirItem?.title || "Unknown"}</p>
                              <p className="text-[9px] text-gray-500 uppercase">You Want</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <img
                                src={getImageUrl(theirItem?.images?.[0])}
                                alt="Item"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-xs truncate">{theirItem?.title || "Unknown"}</p>
                              <p className="text-[9px] text-gray-500 uppercase">{isRequester ? 'You Want' : 'They Offer'}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Compact Action Buttons */}
                    <div className="flex justify-end items-center pt-3 border-t border-gray-100/50 gap-2">

                      {swap.status !== 'pending' && swap.status !== 'rejected' && (
                        <Link to={`/swaps/${swap._id}`}>
                          <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200 hover:bg-white hover:shadow-sm transition-all">
                            Details
                          </button>
                        </Link>
                      )}

                      {swap.status === 'pending' && (
                        <>
                          {isRequester ? (
                            // ✅ CANCEL BUTTON (For Requester)
                            <button
                              className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50/80 backdrop-blur-sm rounded-lg border border-red-200 hover:bg-red-100 hover:shadow-sm transition-all"
                              onClick={() => handleCancelSwap(swap._id)}
                            >
                              Cancel
                            </button>
                          ) : (
                            // ✅ ACCEPT/REJECT (For Owner)
                            <>
                              <button
                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg border border-red-600 hover:bg-red-600 hover:shadow-md hover:scale-105 transition-all duration-200"
                                onClick={() => handleRejectSwap(swap._id)}
                              >
                                Reject
                              </button>
                              <button
                                className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg border border-green-600 hover:from-green-600 hover:to-emerald-600 hover:shadow-md hover:scale-105 transition-all duration-200"
                                onClick={() => handleAcceptSwap(swap._id)}
                              >
                                Accept
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {swap.status === 'accepted' && (
                        <div className="w-full flex items-center justify-between bg-green-50/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-green-200">
                          <p className="text-xs text-green-700 font-medium">
                            🎉 Accepted! Connect to exchange.
                          </p>
                          <button
                            className="px-2.5 py-1 text-[10px] font-bold text-white bg-green-600 rounded-md hover:bg-green-700 transition-all"
                            onClick={() => handleCompleteSwap(swap._id)}
                          >
                            Complete
                          </button>
                        </div>
                      )}

                      {swap.status === 'completed' && (
                        <p className="text-xs text-blue-700 w-full text-center bg-blue-50/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-blue-200 font-medium">
                          ✅ Swap completed!
                        </p>
                      )}

                      {swap.status === 'rejected' && (
                        <p className="text-xs text-red-600 font-medium bg-red-50/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-200 w-full text-center">
                          ❌ Request rejected
                        </p>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Swaps;