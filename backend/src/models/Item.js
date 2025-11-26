// backend/src/models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  category: { type: String },
  type: { type: String },
  size: { type: String },
  condition: { type: String },
  tags: [{ type: String }],
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'swapped', 'available'], default: 'pending' },
  pointsValue: { type: Number, default: 0 },
  // New: Geolocation Field
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  createdAt: { type: Date, default: Date.now }
});

itemSchema.index({ location: '2dsphere' }); // Index for geo queries

module.exports = mongoose.model('Item', itemSchema);