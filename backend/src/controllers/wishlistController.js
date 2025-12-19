const User = require('../models/User');
const Item = require('../models/Item');

const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'wishlist',
            populate: { path: 'owner', select: 'name email avatar' }
        });
        res.json(user.wishlist);
    } catch (error) {
        console.error('Error in getWishlist:', error);
        res.status(500).json({ message: 'Server error retrieving wishlist' });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const { itemId } = req.body;

        if (!itemId) {
            return res.status(400).json({ message: 'Item ID is required' });
        }

        // Use $addToSet to prevent duplicates and ensure atomic update
        await User.findByIdAndUpdate(
            req.user.id,
            { $addToSet: { wishlist: itemId } }
        );

        // Fetch and return the populated wishlist
        const populatedUser = await User.findById(req.user.id).populate({
            path: 'wishlist',
            populate: { path: 'owner', select: 'name email avatar' }
        });

        res.json(populatedUser.wishlist);
    } catch (error) {
        console.error('Error in addToWishlist:', error);
        res.status(500).json({ message: 'Server error adding to wishlist' });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { itemId } = req.params;

        if (!itemId) {
            return res.status(400).json({ message: 'Item ID is required' });
        }

        // Use $pull to remove the item atomically
        await User.findByIdAndUpdate(
            req.user.id,
            { $pull: { wishlist: itemId } }
        );

        // Fetch and return the populated wishlist
        const populatedUser = await User.findById(req.user.id).populate({
            path: 'wishlist',
            populate: { path: 'owner', select: 'name email avatar' }
        });

        res.json(populatedUser.wishlist);
    } catch (error) {
        console.error('Error in removeFromWishlist:', error);
        res.status(500).json({ message: 'Server error removing from wishlist' });
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
