import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // User check ke liye
import Layout from '../layouts/Layout';
import Button from '../components/ui/Button';
import { swapService } from '../services/swapService';
import { toast } from 'react-hot-toast'; // Errors dikhane ke liye

const Swaps = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Page load hone par swaps fetch karo
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

  // Actions: Accept, Reject, Complete
  const handleAcceptSwap = async (swapId) => {
    try {
      await swapService.acceptSwap(swapId);
      toast.success('Swap accepted!');
      fetchSwaps(); // List refresh karo
    } catch (error) {
      console.error('Error accepting swap:', error);
      toast.error('Failed to accept swap');
    }
  };

  const handleRejectSwap = async (swapId) => {
    if(!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      await swapService.rejectSwap(swapId);
      toast.success('Swap rejected');
      fetchSwaps();
    } catch (error) {
      console.error('Error rejecting swap:', error);
      toast.error('Failed to reject swap');
    }
  };

  const handleCompleteSwap = async (swapId) => {
    try {
      await swapService.completeSwap(swapId);
      toast.success('Swap marked as completed!');
      fetchSwaps();
    } catch (error) {
      console.error('Error completing swap:', error);
      toast.error('Failed to complete swap');
    }
  };

  // Tabs ke hisaab se filter karo
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

          {/* Tabs Navigation */}
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

          {/* Swaps List */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : filteredSwaps.length === 0 ? (
            <div className="bg-white shadow-sm rounded-lg p-12 text-center border border-gray-100">
              <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps found</h3>
              <p className="text-gray-600">
                {activeTab === 'all'
                  ? "You haven't made or received any swap requests yet."
                  : `No ${activeTab} swaps found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSwaps.map((swap) => (
                <div key={swap._id} className="bg-white shadow-sm rounded-lg p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  {/* Swap Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {swap.requester?._id === user?.id ? 'Outgoing Request' : 'Incoming Request'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(swap.createdAt).toLocaleDateString()} • ID: {swap._id.slice(-6)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${getStatusColor(swap.status)}`}>
                      {swap.status}
                    </span>
                  </div>

                  {/* Items Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative">
                    
                    {/* Your Side */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Item</h4>
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                           <img 
                             src={swap.myItem?.images?.[0] ? `http://localhost:5000/uploads/${swap.myItem.images[0]}` : 'https://via.placeholder.com/100'} 
                             alt="My item" 
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{swap.myItem?.title || "Unknown Item"}</p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{swap.myItem?.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Arrow Icon (Desktop Center) */}
                    <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border border-gray-200 items-center justify-center text-gray-400 z-10 shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                    </div>

                    {/* Other Side */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Requested Item</h4>
                      <div className="flex gap-3">
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                           <img 
                             src={swap.requestedItem?.images?.[0] ? `http://localhost:5000/uploads/${swap.requestedItem.images[0]}` : 'https://via.placeholder.com/100'} 
                             alt="Requested item" 
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{swap.requestedItem?.title || "Unknown Item"}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Owner: <span className="font-medium text-gray-700">{swap.requestedItem?.owner?.name || "Unknown"}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end items-center pt-4 border-t border-gray-100 gap-3">
                    
                    {/* Status: PENDING */}
                    {swap.status === 'pending' && (
                      <>
                        {/* If I am the owner (Incoming Request), I can Accept/Reject */}
                        {swap.owner?._id === user?.id || swap.owner === user?.id ? (
                          <>
                            <Button
                              variant="danger"
                              size="small"
                              className="bg-white text-red-600 border border-red-200 hover:bg-red-50"
                              onClick={() => handleRejectSwap(swap._id)}
                            >
                              Reject Request
                            </Button>
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleAcceptSwap(swap._id)}
                            >
                              Accept Swap
                            </Button>
                          </>
                        ) : (
                          // If I am the requester (Outgoing Request)
                          <span className="text-sm text-yellow-600 font-medium bg-yellow-50 px-3 py-1 rounded-md">
                            Waiting for response...
                          </span>
                        )}
                      </>
                    )}

                    {/* Status: ACCEPTED */}
                    {swap.status === 'accepted' && (
                      <div className="w-full flex items-center justify-between">
                        <p className="text-sm text-green-700 bg-green-50 px-3 py-1 rounded-md border border-green-100">
                          🎉 Swap accepted! Please arrange the exchange.
                        </p>
                        <Button variant="primary" size="small" onClick={() => handleCompleteSwap(swap._id)}>
                          Mark Completed
                        </Button>
                      </div>
                    )}

                    {/* Status: COMPLETED */}
                    {swap.status === 'completed' && (
                      <p className="text-sm text-blue-700 w-full text-center bg-blue-50 px-3 py-2 rounded-md border border-blue-100">
                        ✅ This swap has been completed successfully!
                      </p>
                    )}
                    
                    {/* Status: REJECTED */}
                    {swap.status === 'rejected' && (
                      <p className="text-sm text-red-600">
                        This request was rejected.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Swaps;