require('dotenv').config();
const express = require('express');
const http = require('http'); // 1. HTTP Server import kiya
const { Server } = require('socket.io'); // 2. Socket.io import kiya
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app); // 3. Express app ko HTTP server mein wrap kiya

// 4. Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*", // Frontend URL (Development ke liye '*' rakha hai)
    methods: ["GET", "POST"]
  }
});

// 5. 'io' ko app mein set kiya taaki Controllers use kar sakein
app.set('io', io);

// Middleware
app.use(express.json());
app.use(cors());

// Static Uploads Path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect Database
connectDB();

// 6. Socket Connection Logic (Notification ke liye zaroori)
io.on('connection', (socket) => {
  console.log('socket connected:', socket.id);

  // Jab user login karega, wo apne ID ke room mein join hoga
  socket.on('join_room', (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected');
  });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/swaps', require('./routes/swaps'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/notifications', require('./routes/notifications')); // New: Notification routes
app.use('/api/users', require('./routes/users')); // New: User routes for leaderboard and public profiles


const PORT = process.env.PORT || 5000;

if (require.main === module) {
  // 7. Note: Yahan 'server.listen' use hoga, 'app.listen' nahi
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;