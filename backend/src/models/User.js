const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  
  // Reset Password Fields
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);