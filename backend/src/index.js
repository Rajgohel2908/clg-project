require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // CHANGE 1: path module import kiya
const connectDB = require('./config/db');

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// CHANGE 2: 'uploads' folder ka path fix kiya taaki images sahi se load hon
// Pehle: app.use('/uploads', express.static('src/uploads'));
// Ab (Fix):
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// connect DB
connectDB();

// routes (mounted later)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/swaps', require('./routes/swaps'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wishlist', require('./routes/wishlist'));

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;