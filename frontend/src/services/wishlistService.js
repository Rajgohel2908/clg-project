import api from './api';

export const wishlistService = {
    getWishlist: async () => {
        const response = await api.get('/wishlist');
        return response.data;
    },

    addToWishlist: async (itemId) => {
        const response = await api.post('/wishlist', { itemId });
        return response.data;
    },

    removeFromWishlist: async (itemId) => {
        const response = await api.delete(`/wishlist/${itemId}`);
        return response.data;
    },
};
