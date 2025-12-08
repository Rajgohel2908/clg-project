require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('../models/Item');

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Update documents missing brand, color, size, or type
    const updates = [
      { field: 'brand', value: 'Unknown' },
      { field: 'color', value: 'Unknown' },
      { field: 'size', value: 'Unknown' },
      { field: 'type', value: 'Unknown' },
    ];

    for (const u of updates) {
      const q = { $or: [ { [u.field]: { $exists: false } }, { [u.field]: null }, { [u.field]: '' } ] };
      const res = await Item.updateMany(q, { $set: { [u.field]: u.value } });
      console.log(`Updated ${res.modifiedCount} items: set ${u.field} to "${u.value}" where missing`);
    }

    console.log('Migration complete');
    process.exit(0);
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  }
};

run();
