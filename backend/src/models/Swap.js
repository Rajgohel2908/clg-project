const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemRequested: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  itemOffered: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, // Optional: only for item exchanges
  swapType: { type: String, enum: ['points', 'item'], required: true }, // New: swap method type
  pointsValue: { type: Number }, // Store points value for points-based swaps
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Swap', swapSchema);
