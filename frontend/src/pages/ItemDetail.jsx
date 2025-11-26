import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Button from '../components/ui/Button';
import { itemService } from '../services/itemService';
import { swapService } from '../services/swapService';
import { useAuth } from '../context/AuthContext';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myItems, setMyItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    fetchItemDetails();
    if (user) {
      fetchMyItems();
    }
  }, [id, user]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const data = await itemService.getItemById(id);
      setItem(data);
    } catch (error) {
      console.error('Error fetching item details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyItems = async () => {
    try {
      const data = await itemService.getMyItems();
      setMyItems(data.filter(item => item.status === 'approved'));
    } catch (error) {
      console.error('Error fetching my items:', error);
    }
  };

  const handleSwapRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedItemId) {
      alert('Please select an item to offer');
      return;
    }

    try {
      await swapService.createSwap({
        itemRequestedId: id,
        itemOfferedId: selectedItemId,
        type: 'swap'
      });
      alert('Swap request sent successfully!');
      setShowSwapModal(false);
      navigate('/swaps');
    } catch (error) {
      console.error('Error creating swap:', error);
      alert('Failed to send swap request. Please try again.');
    }
  };

  const handleRedeem = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.points < item.pointsValue) {
      alert('You do not have enough points to redeem this item.');
      return;
    }

    try {
      await swapService.createSwap({
        itemRequestedId: id,
        type: 'redeem'
      });
      alert('Item redeemed successfully!');
      navigate('/swaps');
    } catch (error) {
      console.error('Error redeeming item:', error);
      alert('Failed to redeem item. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
          <Button onClick={() => navigate('/items')}>Back to Items</Button>
        </div>
      </Layout>
    );
  }

  const isOwnItem = user && item.uploader?._id === user.id;

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Image Section */}
              <div>
                <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <img
                    src={item.images[0] ? `http://localhost:5000/uploads/${item.images[0]}` : 'https://via.placeholder.com/500'}
                    alt={item.title}
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/500?text=No+Image';
                    }}
                  />
                </div>
                {item.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {item.images.slice(1, 5).map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000/uploads/${img}`}
                        alt={`${item.title} ${index + 2}`}
                        className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-75"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      item.condition === 'new'
                        ? 'bg-green-100 text-green-800'
                        : item.condition === 'like-new'
                        ? 'bg-blue-100 text-blue-800'
                        : item.condition === 'good'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.condition}
                    </span>
                    <span className="text-sm text-gray-600">{item.category}</span>
                  </div>
                  
                  <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Listed by {item.uploader?.name || 'Anonymous'}
                    </div>
                    
                    {/* 👇 Location Display Added Here */}
                    {item.locationName && (
                      <div className="flex items-center text-green-700 font-medium">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {item.locationName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-700">{item.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {item.type && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Type</p>
                      <p className="text-gray-900">{item.type}</p>
                    </div>
                  )}
                  {item.size && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Size</p>
                      <p className="text-gray-900">{item.size}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-500">Points Value</p>
                    <p className="text-gray-900 font-semibold">{item.pointsValue} points</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Listed Date</p>
                    <p className="text-gray-900">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {!isOwnItem && (
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => setShowSwapModal(true)}
                      className="w-full"
                      disabled={!user}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      Request Swap
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRedeem}
                      className="w-full"
                      disabled={!user || (user && user.points < item.pointsValue)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Redeem with Points ({item.pointsValue})
                    </Button>
                    {!user && (
                      <p className="text-sm text-gray-600 text-center">
                        Please <button onClick={() => navigate('/login')} className="text-green-600 hover:underline">log in</button> to swap items
                      </p>
                    )}
                  </div>
                )}

                {isOwnItem && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm font-medium">This is your item</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <Button variant="outline" onClick={() => navigate('/items')}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Items
            </Button>
          </div>
        </div>
      </div>

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Request Item Swap</h3>
            <p className="text-gray-600 mb-4">Select an item from your collection to offer in exchange:</p>

            {myItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">You don't have any items to swap yet.</p>
                <Button onClick={() => navigate('/add-item')}>Add an Item</Button>
              </div>
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myItems.map((myItem) => (
                      <div
                        key={myItem._id}
                        onClick={() => setSelectedItemId(myItem._id)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedItemId === myItem._id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        <div className="flex gap-4">
                          <img
                            src={myItem.images[0] ? `http://localhost:5000/uploads/${myItem.images[0]}` : 'https://via.placeholder.com/100'}
                            alt={myItem.title}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{myItem.title}</h4>
                            <p className="text-sm text-gray-600">{myItem.category}</p>
                            <p className="text-sm text-gray-500">{myItem.condition}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSwapRequest}
                    disabled={!selectedItemId}
                    className="flex-1"
                  >
                    Send Swap Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSwapModal(false);
                      setSelectedItemId('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ItemDetail;