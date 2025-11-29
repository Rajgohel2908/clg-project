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

const approveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    item.status = 'approved';
    await item.save();
    res.json({ message: 'Item approved successfully' });
  } catch (error) {
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

module.exports = { 
  listPendingItems, 
  approveItem, 
  rejectItem, 
  deleteItem, 
  getDashboardStats, // Export
  getAllUsers        // Export
};