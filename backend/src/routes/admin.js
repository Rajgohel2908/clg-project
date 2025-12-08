const express = require('express');
const { 
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
  deleteItemImage // Import kiya
} = require('../controllers/adminController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

// Stats & Users
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id/items', getUserItemsById);

// Item Management
router.get('/items/pending', listPendingItems);
router.post('/items/:id/approve', approveItem);
router.post('/items/:id/reject', rejectItem);
router.delete('/items/:id', deleteItem);

// 👇 NEW ROUTE: Delete Image
router.delete('/items/:itemId/images', deleteItemImage);

// User Management
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUserPoints);
router.post('/users/:id/reset-password', resetUserPassword);

module.exports = router;