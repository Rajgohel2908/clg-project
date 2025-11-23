import React from 'react';
import Layout from '../layouts/Layout';
import ItemCard from '../components/common/ItemCard';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';

const Wishlist = () => {
    const { wishlist } = useWishlist();

    return (
        <Layout>
            <div className="bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Wishlist</h1>
                        <p className="text-gray-600">Items you've saved for later.</p>
                    </div>

                    {/* Wishlist Items */}
                    {wishlist.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                            <svg
                                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                                />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No items in your wishlist</h3>
                            <p className="text-gray-600 mb-6">Start browsing and save items you love!</p>
                            <Link
                                to="/items"
                                className="inline-block bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
                            >
                                Browse Items
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {wishlist.map((item) => (
                                <ItemCard key={item._id} item={item} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Wishlist;
