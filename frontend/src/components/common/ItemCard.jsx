import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const ItemCard = ({ item }) => {
  const {
    _id,
    title,
    description,
    category,
    condition,
    images = [],
    owner,
    uploader,
    pointsValue,
    locationName
  } = item;

  const displayUser = uploader || owner;
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const inWishlist = isInWishlist(_id);

  const imageUrl = images[0]
    ? images[0].startsWith('http')
      ? images[0]
      : `http://localhost:5000/uploads/${images[0]}`
    : 'https://via.placeholder.com/400x500?text=No+Image';

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (inWishlist) removeFromWishlist(_id);
    else addToWishlist(_id);
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group relative bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-gray-100/50"
    >
      <Link to={`/items/${_id}`} className="block h-full flex flex-col">
        {/* Image Container - 4:5 Aspect Ratio */}
        <div className="relative aspect-[4/5] overflow-hidden m-2 rounded-[1.5rem]">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x500?text=No+Image'; }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Floating Glass Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="px-3 py-1 text-[10px] font-bold tracking-wider text-white bg-black/30 backdrop-blur-md rounded-full uppercase border border-white/10">
              {category}
            </span>
            {condition === 'new' && (
              <span className="px-3 py-1 text-[10px] font-bold text-white bg-emerald-500/90 backdrop-blur-md rounded-full shadow-lg shadow-emerald-500/20">
                NEW
              </span>
            )}
          </div>

          {user && (
            <button
              onClick={handleWishlistToggle}
              className="absolute top-3 right-3 p-2.5 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-all duration-200 active:scale-95 shadow-sm"
            >
              <svg
                className={`w-5 h-5 transition-colors duration-200 ${
                  inWishlist ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600'
                }`}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="px-5 pb-5 pt-2 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-1 group-hover:text-green-600 transition-colors">
                {title}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-gray-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="text-xs font-medium truncate">
                  {locationName || 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-lg font-extrabold text-green-600">{pointsValue}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Points</span>
            </div>
          </div>

          {/* User Pill */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
            <div className="flex items-center gap-2 pl-1">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-600 ring-2 ring-white">
                {displayUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {displayUser?.name || 'Anonymous'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ItemCard;