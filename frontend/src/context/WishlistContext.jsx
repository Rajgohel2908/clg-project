import React, { createContext, useState, useContext, useEffect } from 'react';
import { wishlistService } from '../services/wishlistService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const data = await wishlistService.getWishlist();
            setWishlist(data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const addToWishlist = async (itemId) => {
        try {
            const updatedWishlist = await wishlistService.addToWishlist(itemId);
            setWishlist(updatedWishlist);
            toast.success('Added to wishlist');
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            toast.error('Failed to add to wishlist');
        }
    };

    const removeFromWishlist = async (itemId) => {
        try {
            const updatedWishlist = await wishlistService.removeFromWishlist(itemId);
            setWishlist(updatedWishlist);
            toast.success('Removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove from wishlist');
        }
    };

    const isInWishlist = (itemId) => {
        return wishlist.some(item => item._id === itemId || item === itemId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
