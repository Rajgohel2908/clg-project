import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import Button from '../components/ui/Button';
import { swapService } from '../services/swapService';

const Swaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchSwaps();
  }, []);

  const fetchSwaps = async () => {
    try {
      setLoading(true);
      const data = await swapService.getMySwaps();
      setSwaps(data);
    } catch (error) {
      console.error('Error fetching swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptSwap = async (swapId) => {
    try {
      await swapService.acceptSwap(swapId);
      fetchSwaps(); // Refresh the list
    } catch (error) {
      console.error('Error accepting swap:', error);
    }
  };

  const handleRejectSwap = async (swapId) => {
    try {
      await swapService.rejectSwap(swapId);
      fetchSwaps(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting swap:', error);
    }
  };

  const filteredSwaps = swaps.filter(swap => {
    if (activeTab === 'all') return true;
    return swap.status.toLowerCase() === activeTab;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
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
          <div className="bg-white shadow-sm rounded-lg mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {['all', 'pending', 'accepted', 'completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                      activeTab === tab
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab}
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
            <div className="bg-white shadow-sm rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps found</h3>
              <p className="text-gray-600">
                {activeTab === 'all'
                  ? "You haven't made any swap requests yet."
                  : `No ${activeTab} swaps found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSwaps.map((swap) => (
                <div key={swap._id} className="bg-white shadow-sm rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Swap Request
                      </h3>
                      <p className="text-sm text-gray-600">
                        Created {new Date(swap.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(swap.status)}`}>
                      {swap.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Your Item</h4>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium">{swap.myItem?.title}</p>
                        <p className="text-sm text-gray-600">{swap.myItem?.description}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Requested Item</h4>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="font-medium">{swap.requestedItem?.title}</p>
                        <p className="text-sm text-gray-600">{swap.requestedItem?.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Owner: {swap.requestedItem?.owner?.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {swap.status === 'pending' && (
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleRejectSwap(swap._id)}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => handleAcceptSwap(swap._id)}
                      >
                        Accept
                      </Button>
                    </div>
                  )}

                  {swap.status === 'accepted' && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <p className="text-sm text-green-800">
                        🎉 Swap accepted! Contact {swap.requestedItem?.owner?.name} to arrange the exchange.
                      </p>
                    </div>
                  )}

                  {swap.status === 'completed' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <p className="text-sm text-blue-800">
                        ✅ This swap has been completed successfully!
                      </p>
                    </div>
                  )}
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