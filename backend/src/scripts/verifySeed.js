// backend/src/scripts/verifySeed.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const userCount = await User.countDocuments();
        const itemCount = await Item.countDocuments();
        const swapCount = await Swap.countDocuments();

        console.log('Verification Results:');
        console.log(`Users: ${userCount}`);
        console.log(`Items: ${itemCount}`);
        console.log(`Swaps: ${swapCount}`);

        if (userCount > 0 && itemCount > 0 && swapCount > 0) {
            console.log('SUCCESS: Data seeded correctly.');
        } else {
            console.log('FAILURE: Some data is missing.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error verifying data:', error);
        process.exit(1);
    }
};

verifyData();
