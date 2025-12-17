import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Button from '../components/ui/Button';
import { itemService } from '../services/itemService';
import { swapService } from '../services/swapService';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Swap Logic States
  const [swapping, setSwapping] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [myItems, setMyItems] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [loadingMyItems, setLoadingMyItems] = useState(false);

  // 👇 FIX: User ID ko standardize kiya (Login vs Refresh issue fix)
  const currentUserId = user ? (user._id || user.id) : null;

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      const data = await itemService.getItemById(id);
      setItem(data);
    } catch (error) {
      console.error('Error fetching item details:', error);
      toast.error('Failed to load item details');
    } finally {
      setLoading(false);
    }
  };

  // 1. Open Modal & Fetch My Items
  const handleSwapClick = async () => {
    if (!currentUserId) {
      toast.error('Please login to request a swap');
      // Agar AuthModal context se open kar sakein to wo karein, nahi to redirect
      navigate('/'); 
      return;
    }

    // 👇 FIX: Owner check ab 'currentUserId' use karega
    const ownerId = item.uploader?._id || item.owner?._id;
    if (ownerId === currentUserId) {
        toast.error("You cannot swap with your own item!");
        return;
    }

    setShowSwapModal(true);
    setLoadingMyItems(true);

    try {
      const items = await itemService.getMyItems();
      // Filter items: Approved/Available AND not the current item
      const validItems = items.filter(i => 
        ['approved', 'available'].includes(i.status) && i._id !== id
      );
      setMyItems(validItems);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your items");
      setShowSwapModal(false);
    } finally {
      setLoadingMyItems(false);
    }
  };

  // 2. Submit the Swap Request
  const submitSwapRequest = async () => {
    if (!selectedOfferId) {
      toast.error('Please select an item to offer in exchange');
      return;
    }

    setSwapping(true);
    try {
      const ownerId = item.uploader?._id || item.owner?._id;
      const requesterId = user ? (user._id || user.id) : null;

      await swapService.createSwap({
        requesterId,
        ownerId,
        itemRequestedId: id,
        itemOfferedId: selectedOfferId,
      });
      
      toast.success('Swap request sent successfully!');
      setShowSwapModal(false);
      setSelectedOfferId(null);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to send swap request');
    } finally {
      setSwapping(false);
    }
  };

  const handleWishlistToggle = () => {
    if (!currentUserId) return;
    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/600x600?text=No+Image';
    return img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  if (!item) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Item not found</h2>
          <Link to="/items" className="text-green-600 hover:text-green-700 mt-4 inline-block">
            Back to Items
          </Link>
        </div>
      </Layout>
    );
  }

  const displayUser = item.uploader || item.owner;
  const imageUrls = item.images && item.images.length > 0 
    ? item.images.map(getImageUrl)
    : ['https://via.placeholder.com/600x600?text=No+Image'];

  // 👇 FIX: Check if current user is owner (to hide button)
  const isOwner = displayUser?._id === currentUserId;

  return (
    <Layout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-500 hover:text-green-600 transition-colors mb-6 group"
        >
          <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to browsing
        </button>

        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* IMAGE SECTION */}
            <div className="bg-gray-100 p-6 flex flex-col justify-center">
              <motion.div 
                layoutId={`item-image-${id}`}
                className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 mb-4"
              >
                <img
                  src={imageUrls[selectedImage]}
                  alt={item.title}
                  className="w-full h-full object-contain p-2"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/600x600?text=No+Image'; }}
                />
                
                {currentUserId && (
                  <button
                    onClick={handleWishlistToggle}
                    className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all active:scale-95"
                  >
                    <svg className={`w-6 h-6 ${isInWishlist(id) ? 'fill-red-500 text-red-500' : 'fill-none text-gray-400 hover:text-red-500'}`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                )}
              </motion.div>

              {/* Thumbnails */}
              {imageUrls.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 px-2 justify-center relative z-10">
                  {imageUrls.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === index ? 'border-green-500 shadow-md scale-105' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-contain bg-white" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DETAILS SECTION */}
            <div className="p-8 md:p-10 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 text-xs font-bold tracking-wider text-white bg-black/70 rounded-full uppercase">
                      {item.category}
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold text-white rounded-full uppercase shadow-sm ${
                      item.condition === 'new' ? 'bg-emerald-500' : 
                      item.condition === 'like new' ? 'bg-blue-500' : 'bg-amber-500'
                    }`}>
                      {item.condition}
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{item.title}</h1>
                </div>
                <div className="flex flex-col items-end bg-green-50 px-4 py-3 rounded-2xl border border-green-100">
                  <span className="text-3xl font-extrabold text-green-600">{item.pointsValue}</span>
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Points</span>
                </div>
              </div>

              <div className="flex items-center text-gray-500 mb-8 bg-gray-50 w-fit px-4 py-2 rounded-full">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{item.locationName || 'Location not specified'}</span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                <div><h3 className="text-sm font-bold text-gray-400 uppercase mb-1">Brand</h3><p className="font-semibold text-gray-900">{item.brand || '-'}</p></div>
                <div><h3 className="text-sm font-bold text-gray-400 uppercase mb-1">Size</h3><p className="font-semibold text-gray-900">{item.size || '-'}</p></div>
                <div><h3 className="text-sm font-bold text-gray-400 uppercase mb-1">Color</h3><p className="font-semibold text-gray-900">{item.color || '-'}</p></div>
                <div><h3 className="text-sm font-bold text-gray-400 uppercase mb-1">Type</h3><p className="font-semibold text-gray-900 capitalize">{item.type || '-'}</p></div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About this item</h3>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{item.description}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full font-medium">#{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-900 flex items-center justify-center text-lg font-bold text-white shadow-md">
                    {displayUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Listed by</p>
                    <p className="font-bold text-gray-900">{displayUser?.name || 'Anonymous'}</p>
                  </div>
                </div>

                {/* 👇 FIX: Sirf tab dikhao jab User Login ho aur wo OWNER NA HO */}
                {currentUserId && !isOwner && (
                  <Button 
                    size="large" 
                    onClick={handleSwapClick} 
                    className="shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                  >
                    Request Swap
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* SWAP OFFER SELECTION MODAL */}
      <AnimatePresence>
        {showSwapModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Select an item to swap</h3>
                <p className="text-sm text-gray-500 mt-1">Choose one of your items to offer in exchange for <strong>{item.title}</strong>.</p>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {loadingMyItems ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : myItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">You don't have any approved items to swap.</p>
                    <Link to="/add-item" className="text-green-600 font-medium hover:underline">List an item first!</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {myItems.map((myItem) => (
                      <div 
                        key={myItem._id}
                        onClick={() => setSelectedOfferId(myItem._id)}
                        className={`flex items-center gap-4 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedOfferId === myItem._id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <img 
                          src={getImageUrl(myItem.images[0])} 
                          alt={myItem.title} 
                          className="w-16 h-16 rounded-lg object-cover bg-white"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{myItem.title}</h4>
                          <p className="text-xs text-gray-500">{myItem.condition} • {myItem.brand || 'No Brand'}</p>
                        </div>
                        {selectedOfferId === myItem._id && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50">
                <button 
                  onClick={() => { setShowSwapModal(false); setSelectedOfferId(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitSwapRequest}
                  disabled={!selectedOfferId || swapping}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {swapping ? 'Sending...' : 'Confirm Swap'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default ItemDetail;