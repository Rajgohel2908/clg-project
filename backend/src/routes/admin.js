const express = require('express');
const { 
  listPendingItems, 
  approveItem, 
  rejectItem, 
  deleteItem,
  getDashboardStats, // Import
  getAllUsers        // Import
} = require('../controllers/adminController');
const auth = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth);

// List pending items for approval
router.get('/items/pending', listPendingItems);

// 👇 NEW ROUTES
router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);

// Approve/Reject/Delete
router.post('/items/:id/approve', approveItem);
router.post('/items/:id/reject', rejectItem);
router.delete('/items/:id', deleteItem);

module.exports = router;