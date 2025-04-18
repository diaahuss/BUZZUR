const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Express
app.use(cors({
  origin: 'https://diaahuss.github.io', // Replace with your frontend's domain
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Initialize Socket.IO with CORS options
const io = socketIo(server, {
  cors: {
    origin: 'https://diaahuss.github.io', // Replace with your frontend's domain
    methods: ['GET', 'POST'],
  },
});

// Define your Socket.IO events
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('buzz', (data) => {
    console.log('Buzz received:', data);
    // Handle the buzz event here
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start the server
server.listen(10000, () => {
  console.log('Server running on port 10000');
});
