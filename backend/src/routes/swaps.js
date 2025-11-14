const express = require('express');
const { createSwap, listUserSwaps, acceptSwap, rejectSwap } = require('../controllers/swapController');
const auth = require('../middleware/auth');

const router = express.Router();

// All swap routes require authentication
router.use(auth);

// Create a swap request or redeem
router.post('/', createSwap);

// List user's swaps
router.get('/my-swaps', listUserSwaps);

// Accept a swap (owner only)
router.put('/:id/accept', acceptSwap);

// Reject a swap (owner only)
router.put('/:id/reject', rejectSwap);

module.exports = router;