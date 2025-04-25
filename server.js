// Importing required modules
const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');
const cors = require('cors');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins (you can restrict this for security)
    methods: ["GET", "POST"]
  }
});

// Use environment port if available (for deployment)
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Optional: Support SPA routing by redirecting unknown routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('buzz', (message) => {
    console.log('Buzz received:', message);
    io.emit('buzz', message); // Broadcast to all clients
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
