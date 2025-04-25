// server.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

<<<<<<< HEAD
// Initialize Express and HTTP Server
=======
// Initialize Express and HTTP server
>>>>>>> 18c589041182852b3bc1644a627a34b610ec81f6
const app = express();
const server = http.createServer(app);

// Enable CORS for all origins and parse JSON
app.use(cors());
<<<<<<< HEAD
app.use(express.json()); // To parse JSON requests
=======
app.use(express.json());
>>>>>>> 18c589041182852b3bc1644a627a34b610ec81f6

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
<<<<<<< HEAD
    origin: '*', // Allow all origins (you might restrict this in production)
=======
    origin: '*',
>>>>>>> 18c589041182852b3bc1644a627a34b610ec81f6
    methods: ['GET', 'POST'],
  },
});

<<<<<<< HEAD
// WebSocket connection
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Handle the 'buzz' event from the client
=======
// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

>>>>>>> 18c589041182852b3bc1644a627a34b610ec81f6
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
  const { to, from, group } = req.body;

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
<<<<<<< HEAD
  console.log(`Server listening on port ${PORT}`);
=======
  console.log(`Buzzur server listening on port ${PORT}`);
>>>>>>> 18c589041182852b3bc1644a627a34b610ec81f6
});
