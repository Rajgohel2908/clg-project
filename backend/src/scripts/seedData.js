// backend/src/scripts/seedData.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');

const seedData = async () => {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected for seeding...');

        // 2. Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Item.deleteMany({});
        await Swap.deleteMany({});
        console.log('Data cleared.');

        // 3. Create Users
        console.log('Creating users...');
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        const users = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: password,
                role: 'admin',
                points: 100
            },
            {
                name: 'Alice Johnson',
                email: 'alice@example.com',
                password: password,
                role: 'user',
                points: 50
            },
            {
                name: 'Bob Smith',
                email: 'bob@example.com',
                password: password,
                role: 'user',
                points: 20
            },
            {
                name: 'Charlie Brown',
                email: 'charlie@example.com',
                password: password,
                role: 'user',
                points: 10
            }
        ];

        const createdUsers = await User.insertMany(users);
        console.log(`${createdUsers.length} users created.`);

        // Map users for easy access
        const admin = createdUsers.find(u => u.email === 'admin@example.com');
        const alice = createdUsers.find(u => u.email === 'alice@example.com');
        const bob = createdUsers.find(u => u.email === 'bob@example.com');
        const charlie = createdUsers.find(u => u.email === 'charlie@example.com');

        // 4. Create Items
        console.log('Creating items...');
        // Helper to create random coordinates around a center point (e.g., New York City for demo)
        // Center: 40.7128° N, 74.0060° W
        const getRandLoc = () => {
            const lat = 40.7128 + (Math.random() - 0.5) * 0.1; // +/- ~5km
            const lng = -74.0060 + (Math.random() - 0.5) * 0.1;
            return { type: 'Point', coordinates: [lng, lat] };
        };

        const items = [
            {
                title: 'Calculus Textbook',
                description: 'Used calculus textbook, good condition. 8th Edition.',
                category: 'Books',
                type: 'Education',
                condition: 'Good',
                uploader: alice._id,
                status: 'available',
                pointsValue: 10,
                location: getRandLoc(),
                images: ['https://via.placeholder.com/300?text=Calculus+Book']
            },
            {
                title: 'Scientific Calculator',
                description: 'Casio FX-991EX, barely used.',
                category: 'Electronics',
                type: 'Gadgets',
                condition: 'Like New',
                uploader: alice._id,
                status: 'available',
                pointsValue: 15,
                location: getRandLoc(),
                images: ['https://via.placeholder.com/300?text=Calculator']
            },
            {
                title: 'Lab Coat',
                description: 'White lab coat, size M. Required for chemistry labs.',
                category: 'Clothing',
                type: 'Uniform',
                condition: 'Fair',
                uploader: bob._id,
                status: 'available',
                pointsValue: 5,
                location: getRandLoc(),
                images: ['https://via.placeholder.com/300?text=Lab+Coat']
            },
            {
                title: 'Drafter for Engineering',
                description: 'Mini drafter for engineering drawing.',
                category: 'Stationery',
                type: 'Tools',
                condition: 'Good',
                uploader: bob._id,
                status: 'pending', // Waiting for approval
                pointsValue: 8,
                location: getRandLoc(),
                images: ['https://via.placeholder.com/300?text=Drafter']
            },
            {
                title: 'Guitar',
                description: 'Acoustic guitar, needs new strings.',
                category: 'Music',
                type: 'Instrument',
                condition: 'Used',
                uploader: charlie._id,
                status: 'available',
                pointsValue: 25,
                location: getRandLoc(),
                images: ['https://via.placeholder.com/300?text=Guitar']
            },
            {
                title: 'Cycling Helmet',
                description: 'Safety first! Medium size.',
                category: 'Sports',
                type: 'Gear',
                condition: 'New',
                uploader: charlie._id,
                status: 'swapped', // Already swapped
                pointsValue: 12,
                location: getRandLoc(),
                images: ['https://via.placeholder.com/300?text=Helmet']
            },
            {
                title: 'MacBook Pro 2015',
                description: 'Old but reliable. Battery needs service.',
                category: 'Electronics',
                type: 'Laptop',
                condition: 'Used',
                uploader: admin._id,
                status: 'available',
                pointsValue: 50,
                location: getRandLoc(),
                images: ['https://via.placeholder.com/300?text=MacBook']
            }
        ];

        const createdItems = await Item.insertMany(items);
        console.log(`${createdItems.length} items created.`);

        // 5. Create Swaps
        console.log('Creating swaps...');
        const swaps = [
            {
                requester: bob._id,
                owner: alice._id,
                itemRequested: createdItems[0]._id, // Calculus Textbook
                status: 'pending'
            },
            {
                requester: charlie._id,
                owner: bob._id,
                itemRequested: createdItems[2]._id, // Lab Coat
                status: 'accepted'
            },
            {
                requester: alice._id,
                owner: charlie._id,
                itemRequested: createdItems[5]._id, // Helmet (marked as swapped)
                status: 'completed'
            }
        ];

        const createdSwaps = await Swap.insertMany(swaps);
        console.log(`${createdSwaps.length} swaps created.`);

        console.log('Seed data populated successfully!');
        console.log('Test Accounts (Password: password123):');
        users.forEach(u => console.log(`- ${u.email} (${u.role})`));

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
