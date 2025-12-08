const express = require('express');
const { createSwap, getSwapById, listUserSwaps, acceptSwap, rejectSwap, completeSwap, debugSwaps } = require('../controllers/swapController');
const auth = require('../middleware/auth');

const router = express.Router();

// All swap routes require authentication
router.use(auth);

// Create a swap request or redeem
router.post('/', createSwap);

// List user's swaps
router.get('/my-swaps', listUserSwaps);

// Get a single swap by ID
router.get('/:id', getSwapById);

// Accept a swap (owner only)
router.put('/:id/accept', acceptSwap);

// Reject a swap (owner only)
router.put('/:id/reject', rejectSwap);

// Mark swap completed (participants)
router.put('/:id/complete', completeSwap);

// Debug route: GET /api/swaps/debug/:userId  (only active in non-production or when DEBUG=true)
router.get('/debug/:userId', (req, res) => debugSwaps(req, res));

module.exports = router;