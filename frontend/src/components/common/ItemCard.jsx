import React from 'react';
import { Link } from 'react-router-dom';

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

  const imageUrl = images[0] 
    ? `http://localhost:5000/uploads/${images[0]}` 
    : '/placeholder-item.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-w-1 aspect-h-1 bg-gray-200">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {title}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            condition === 'new'
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