// Script to create an admin user or update existing user to admin
// Run this with: node src/scripts/createAdmin.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    // Option 1: Update existing user to admin by email
    const emailToUpdate = 'admin@gmail.com'; // admin email to create/update
    const existingUser = await User.findOne({ email: emailToUpdate.toLowerCase() });
    
    if (existingUser) {
      existingUser.role = 'admin';
      await existingUser.save();
      console.log(`✓ User ${existingUser.email} has been updated to admin role`);
    } else {
      // Option 2: Create new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      const adminUser = new User({
        name: 'Admin User',
        email: emailToUpdate.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        points: 0
      });

      await adminUser.save();
      console.log('✓ Admin user created successfully');
      console.log(`Email: ${emailToUpdate}`);
      console.log('Password: admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdminUser();
