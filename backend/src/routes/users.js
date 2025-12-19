const express = require('express');
const { getLeaderboard, getUserPublicProfile } = require('../controllers/userController');
const router = express.Router();

// Public routes - no authentication required
router.get('/leaderboard', getLeaderboard);
router.get('/:userId/profile', getUserPublicProfile);

module.exports = router;
