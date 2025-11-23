import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

const ItemCard = ({ item }) => {
  const {
    _id,
    title,
    description,
    category,
    condition,
    images = [],
    owner,
    createdAt
  } = item;

  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();
  const inWishlist = isInWishlist(_id);

  const imageUrl = images[0]
    ? `http://localhost:5000/uploads/${images[0]}`
    : '/placeholder-item.jpg';

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (!user) {
      return;
    }
    if (inWishlist) {
      removeFromWishlist(_id);
    } else {
      addToWishlist(_id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-w-1 aspect-h-1 bg-gray-200">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        {user && (
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform duration-200"
          >
            <svg
              className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'fill-none text-gray-600'}`}
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {title}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${condition === 'new'
              ? 'bg-green-100 text-green-800'
              : condition === 'like-new'
                ? 'bg-blue-100 text-blue-800'
                : condition === 'good'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
            }`}>
            {condition}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500">
            {category}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            by {owner?.name || 'Anonymous'}
          </span>
          <Link
            to={`/items/${_id}`}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;