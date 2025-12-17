const express = require('express');
const { createSwap, listUserSwaps, getSwapDetails, acceptSwap, rejectSwap, completeSwap, deleteSwap } = require('../controllers/swapController'); // deleteSwap import kiya
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/', createSwap);
router.get('/my-swaps', listUserSwaps);
router.get('/:swapId', getSwapDetails);
router.put('/:swapId/accept', acceptSwap);
router.put('/:swapId/reject', rejectSwap);
router.put('/:swapId/complete', completeSwap);

// 👇 NEW: Delete Route Add kiya (Cancel ke liye)
router.delete('/:swapId', deleteSwap);

module.exports = router;