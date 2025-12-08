require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/Item');

const deleteAllItems = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI missing in .env');
      process.exit(1);
    }
    
    console.log('🔌 Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    console.log('🗑️ Deleting all items...');
    const result = await Item.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} items.`);

    console.log('\n=============================================');
    console.log('🎉 All items deleted successfully!');
    console.log('=============================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting items:', error);
    process.exit(1);
  }
};

deleteAllItems();