const express = require('express');
const { createSwap, listUserSwaps, acceptSwap, rejectSwap, completeSwap, deleteSwap } = require('../controllers/swapController'); // deleteSwap import kiya
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', createSwap);
router.get('/my-swaps', listUserSwaps);
router.put('/:id/accept', acceptSwap);
router.put('/:id/reject', rejectSwap);
router.put('/:id/complete', completeSwap);

// 👇 NEW: Delete Route Add kiya (Cancel ke liye)
router.delete('/:id', deleteSwap);

module.exports = router;