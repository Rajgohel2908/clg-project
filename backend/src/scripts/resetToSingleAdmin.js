require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const Notification = require('../models/Notification');

async function resetToSingleAdmin() {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI not defined');
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Remove all data except keep admin we'll create
    console.log('Removing Items, Swaps, Notifications, and Users...');
    await Promise.all([
      Item.deleteMany({}),
      Swap.deleteMany({}),
      Notification.deleteMany({}),
      User.deleteMany({})
    ]);

    // Create single admin user
    const name = 'aniket';
    const email = 'aniket@gmail.com';
    const rawPassword = 'aniket';

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(rawPassword, salt);

    const admin = new User({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: 'admin',
      points: 0
    });

    await admin.save();
    console.log('Created admin user:');
    console.log(`  email: ${email}`);
    console.log(`  password: ${rawPassword}`);

    await mongoose.disconnect();
    console.log('Done. Database reset to single admin.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

resetToSingleAdmin();
