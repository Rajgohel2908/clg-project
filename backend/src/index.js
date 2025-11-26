// backend/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http'); // New import
const { Server } = require('socket.io'); // New import
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app); // Wrap express app

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL (Adjust if different)
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('src/uploads'));

// connect DB
connectDB();

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/swaps', require('./routes/swaps'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wishlist', require('./routes/wishlist'));

const PORT = process.env.PORT || 5000;
// Change app.listen to server.listen
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;