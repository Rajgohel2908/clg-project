const express = require('express');
const {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');

const router = express.Router();

// All notification routes require authentication
router.use(auth);

// Get all notifications for logged-in user
router.get('/', getMyNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Mark specific notification as read
router.put('/:id/read', markAsRead);

module.exports = router;
