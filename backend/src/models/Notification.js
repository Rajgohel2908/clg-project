// backend/src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['swap_request', 'swap_accepted', 'swap_rejected', 'swap_completed', 'swap_cancelled'],
    required: true
  },
  message: { type: String },
  relatedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, // New: reference to item involved
  relatedSwap: { type: mongoose.Schema.Types.ObjectId, ref: 'Swap' }, // New: reference to swap
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);