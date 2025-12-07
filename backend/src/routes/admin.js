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
  getUserItemsById
} = require('../controllers/adminController');
const auth = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth);

// List pending items for approval
router.get('/items/pending', listPendingItems);

// NEW ROUTES
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
// Get items for a specific user
router.get('/users/:id/items', getUserItemsById);

// Approve/Reject/Delete items
router.post('/items/:id/approve', approveItem);
router.post('/items/:id/reject', rejectItem);
router.delete('/items/:id', deleteItem);

// User management routes
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUserPoints);
router.post('/users/:id/reset-password', resetUserPassword);

module.exports = router;