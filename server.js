// server.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Enable CORS for all origins and parse JSON
app.use(cors());
app.use(express.json()); // To parse JSON requests

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (you might restrict this in production)
    methods: ['GET', 'POST'],
  },
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('buzz', (payload) => {
    console.log('Buzz received via socket:', payload);

    // Basic validation
    if (Array.isArray(payload) && payload.length > 0) {
      socket.broadcast.emit('buzz', payload); // Send to others
    } else {
      console.warn('Invalid socket buzz payload:', payload);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Buzzur server is running.');
});

// Buzz API endpoint
  app.post('/send-buzz', (req, res) => {
  // Your POST route logic here
});

  // Validate input
  if (!Array.isArray(to) || to.length === 0) {
    return res.status(400).json({ success: false, message: 'Recipient list is required.' });
  }
  if (!from || !group) {
    return res.status(400).json({ success: false, message: 'Sender and group information are required.' });
  }

  console.log(`Buzz sent from ${from} to ${to.join(', ')} in group "${group}"`);

  // Emit buzz event via socket
  io.emit('buzz', { to, from, group });

  res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Buzzur server listening on port ${PORT}`);
});
