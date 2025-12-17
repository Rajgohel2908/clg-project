import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../layouts/Layout';
import Button from '../components/ui/Button';
import { swapService } from '../services/swapService';
import { toast } from 'react-hot-toast';
import api from '../services/api';

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
    if(!window.confirm("Reject this request?")) return;
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
    if(!window.confirm("Are you sure you want to cancel this request?")) return;
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
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize whitespace-nowrap transition-colors ${
                      activeTab === tab
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
                  <div key={swap._id} className="bg-white shadow-sm rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isRequester ? 'Outgoing Request (You asked)' : 'Incoming Request (They asked)'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {swap._id.slice(-6)} • {new Date(swap.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${getStatusColor(swap.status)}`}>
                        {swap.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* My Side */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                          {isRequester ? "You Offered" : "You Give"}
                        </h4>
                        <div className="flex gap-3">
                          <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                            <img 
                              src={getImageUrl(myItem?.images?.[0])} 
                              alt="Item" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1">{myItem?.title || "Unknown Item"}</p>
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{myItem?.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Their Side */}
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                          {isRequester ? "You Want" : "They Offer"}
                        </h4>
                        <div className="flex gap-3">
                          <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                            <img 
                              src={getImageUrl(theirItem?.images?.[0])} 
                              alt="Item" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 line-clamp-1">{theirItem?.title || "Unknown Item"}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Owner: <span className="font-medium text-gray-700">{theirItem?.owner?.name || "Unknown"}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end items-center pt-4 border-t border-gray-100 gap-3">
                      
                      {swap.status !== 'pending' && swap.status !== 'rejected' && (
                        <Link to={`/swaps/${swap._id}`}>
                          <Button variant="outline" size="small">
                            View Details
                          </Button>
                        </Link>
                      )}

                      {swap.status === 'pending' && (
                        <>
                          {isRequester ? (
                            // ✅ CANCEL BUTTON (For Requester)
                            <Button
                              variant="outline"
                              size="small"
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                              onClick={() => handleCancelSwap(swap._id)}
                            >
                              Cancel Request
                            </Button>
                          ) : (
                            // ✅ ACCEPT/REJECT (For Owner)
                            <>
                              <Button
                                variant="danger"
                                size="small"
                                className="bg-white text-red-600 border border-red-200 hover:bg-red-50"
                                onClick={() => handleRejectSwap(swap._id)}
                              >
                                Reject
                              </Button>
                              <Button
                                variant="primary"
                                size="small"
                                onClick={() => handleAcceptSwap(swap._id)}
                              >
                                Accept Swap
                              </Button>
                            </>
                          )}
                        </>
                      )}

                      {swap.status === 'accepted' && (
                        <div className="w-full flex items-center justify-between">
                          <p className="text-sm text-green-700 font-medium">
                            🎉 Swap Accepted! Connect with {isRequester ? theirItem?.owner?.name : swap.requester?.name} to exchange.
                          </p>
                          <Button variant="primary" size="small" onClick={() => handleCompleteSwap(swap._id)}>
                            Mark Completed
                          </Button>
                        </div>
                      )}

                      {swap.status === 'completed' && (
                        <p className="text-sm text-blue-700 w-full text-center bg-blue-50 px-3 py-2 rounded-md border border-blue-100 font-medium">
                          ✅ Swap successfully completed!
                        </p>
                      )}

                      {swap.status === 'rejected' && (
                        <p className="text-sm text-red-600 font-medium bg-red-50 px-3 py-2 rounded-md border border-red-100 w-full text-center">
                          ❌ This request was rejected.
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