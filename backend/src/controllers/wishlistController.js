const User = require('../models/User');
const Item = require('../models/Item');

const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        res.json(user.wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const { itemId } = req.body;
        const user = await User.findById(req.user.id);

        if (!user.wishlist.includes(itemId)) {
            user.wishlist.push(itemId);
            await user.save();
        }

        // Return the updated wishlist (populated)
        await user.populate('wishlist');
        res.json(user.wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { itemId } = req.params;
        const user = await User.findById(req.user.id);

        user.wishlist = user.wishlist.filter(id => id.toString() !== itemId);
        await user.save();

        // Return the updated wishlist (populated)
        await user.populate('wishlist');
        res.json(user.wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
