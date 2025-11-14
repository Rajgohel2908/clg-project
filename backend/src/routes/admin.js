const express = require('express');
const { listPendingItems, approveItem, rejectItem, deleteItem } = require('../controllers/adminController');
const auth = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(auth);

// List pending items for approval
router.get('/items/pending', listPendingItems);

// Approve an item
router.post('/items/:id/approve', approveItem);

// Reject an item
router.post('/items/:id/reject', rejectItem);

// Delete an item (admin force delete)
router.delete('/items/:id', deleteItem);

module.exports = router;
