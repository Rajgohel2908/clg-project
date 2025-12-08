const Item = require('../models/Item');
const User = require('../models/User');
const Swap = require('../models/Swap');
const fs = require('fs');
const path = require('path');

// Existing functions...
const listPendingItems = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const items = await Item.find({ status: 'pending' }).populate('uploader', 'name email');
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const approveItem = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.status !== 'approved') {
        item.status = 'approved';
        await item.save();

        const uploader = await User.findById(item.uploader);
        if (uploader) {
            uploader.points += item.pointsValue;
            await uploader.save();
        }
    }

    res.json({ message: 'Item approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.status = 'rejected';
    await item.save();
    res.json({ message: 'Item rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalItems = await Item.countDocuments();
    const pendingItems = await Item.countDocuments({ status: 'pending' });
    const totalSwaps = await Swap.countDocuments();

    res.json({ totalUsers, totalItems, pendingItems, totalSwaps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const userId = req.params.id;
    await Item.deleteMany({ uploader: userId });
    await Swap.deleteMany({ $or: [{ requester: userId }, { recipient: userId }] });
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User and all their data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserPoints = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { points } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { points: parseInt(points) },
      { new: true }
    ).select('-password');
    res.json({ message: 'Points updated', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const bcrypt = require('bcryptjs');
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { new: true }
    ).select('-password');
    res.json({ message: 'Password reset successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserItemsById = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const userId = req.params.id;
    const items = await Item.find({ uploader: userId }).sort({ createdAt: -1 }).populate('uploader', 'name');
    res.json({ count: items.length, items });
  } catch (error) {
    console.error('getUserItemsById error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 👇 NEW FUNCTION: Delete specific image from item
const deleteItemImage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { itemId } = req.params;
    const { imageName } = req.body; // Image filename/url to delete

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Filter out the image
    const initialLength = item.images.length;
    item.images = item.images.filter(img => img !== imageName);

    if (item.images.length === initialLength) {
        return res.status(404).json({ message: 'Image not found in this item' });
    }

    await item.save();

    // If it's a local file (not http), delete from uploads folder
    if (imageName && !imageName.startsWith('http')) {
        const filePath = path.join(__dirname, '..', 'uploads', imageName);
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
    }

    res.json({ message: 'Image deleted successfully', images: item.images });
  } catch (error) {
    console.error('deleteItemImage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  listPendingItems, 
  approveItem, 
  rejectItem, 
  deleteItem, 
  getDashboardStats,
  getAllUsers,
  deleteUser,
  updateUserPoints,
  resetUserPassword,
  getUserItemsById,
  deleteItemImage // Exported
};