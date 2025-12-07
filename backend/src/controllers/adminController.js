const Item = require('../models/Item');
const User = require('../models/User');
const Swap = require('../models/Swap'); // Swap model import kiya

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

// backend/src/controllers/adminController.js

const approveItem = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Sirf tab points add karein agar item pehle se approved nahi tha
    if (item.status !== 'approved') {
        item.status = 'approved';
        await item.save();

        // LOGIC ADDED: Uploader ko dhoondo aur points add karo
        const uploader = await User.findById(item.uploader);
        if (uploader) {
            uploader.points += item.pointsValue; // Points add kar diye
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

// 👇 NEW: Real Stats Fetch karne ke liye
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalItems = await Item.countDocuments();
    const pendingItems = await Item.countDocuments({ status: 'pending' });
    const totalSwaps = await Swap.countDocuments();

    res.json({
      totalUsers,
      totalItems,
      pendingItems,
      totalSwaps
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 👇 NEW: Saare Users ki list lane ke liye
const getAllUsers = async (req, res) => {
  try {
    // Admins ko list mein mat dikhana, sirf normal users
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password') // Password mat bhejna galti se bhi
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete User and all their items
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const userId = req.params.id;
    
    // Delete all user's items
    await Item.deleteMany({ uploader: userId });
    
    // Delete all user's swaps
    await Swap.deleteMany({ $or: [{ requester: userId }, { recipient: userId }] });
    
    // Delete user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User and all their data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User Points
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

// Reset User Password
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

// Get items for a specific user (admin only)
const getUserItemsById = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const userId = req.params.id;
    const items = await Item.find({ uploader: userId }).sort({ createdAt: -1 }).populate('uploader', 'name');
    res.json(items);
  } catch (error) {
    console.error('getUserItemsById error', error);
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
  getUserItemsById
};