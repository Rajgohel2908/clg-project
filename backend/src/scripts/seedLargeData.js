require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const Notification = require('../models/Notification');

const seedLargeData = async () => {
    try {
        // 1. Database Connection
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 MongoDB Connected...');

        // 2. Clear Old Data
        console.log('🧹 Cleaning database (Removing Users, Items, Swaps)...');
        await Promise.all([
            User.deleteMany({}),
            Item.deleteMany({}),
            Swap.deleteMany({}),
            Notification.deleteMany({})
        ]);
        console.log('✓ All old data removed.');

        // 3. Create Only 1 Admin User
        console.log('👤 Creating Single Admin User...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('aniket', salt); // Password set to 'aniket'

        const adminUser = new User({
            name: 'aniket',
            email: 'aniket@gmail.com',
            password: hashedPassword,
            role: 'admin',
            points: 1000 // Admin ke paas thode points hone chahiye test ke liye
        });

        await adminUser.save();
        console.log('✓ Admin user created successfully.');

        console.log('\n=============================================');
        console.log('🎉 DATABASE RESET & SEEDED');
        console.log('=============================================');
        console.log('Status:');
        console.log(' -> Users: 1');
        console.log(' -> Items: 0');
        console.log('---------------------------------------------');
        console.log('🔑 LOGIN CREDENTIALS:');
        console.log(' Email:    aniket@gmail.com');
        console.log(' Password: aniket');
        console.log('=============================================');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedLargeData();