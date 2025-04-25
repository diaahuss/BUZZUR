<<<<<<< HEAD
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Modern Socket.IO import
const cors = require('cors');

// Initialize Express and HTTP Server
=======
// server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
const app = express();
const server = http.createServer(app);

// Enable CORS for all origins (for deployment environments)
app.use(cors());
<<<<<<< HEAD

// Serve static files (optional)
app.use(express.static('public'));

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins - adjust if needed for security
=======
app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  cors: {
<<<<<<< HEAD
    origin: '*', // Allow all origins
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
    methods: ['GET', 'POST']
  }
=======
    origin: '*', // Allow all origins (you might restrict this in production)
    methods: ['GET', 'POST'],
  },
>>>>>>> 2fb01014207b83b4c48b14c95ecd9a767bfcfe8e
});

<<<<<<< HEAD
// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('buzz', (data) => {
    console.log(`Buzz event received for group: ${data.groupName}`);
    console.log(`Members: ${data.members.join(', ')}`);

    // Send confirmation back to the same socket
    socket.emit('buzzSent', { status: 'success', groupName: data.groupName });

    // Or broadcast to all clients (if you want others to hear the buzz)
    // io.emit('buzzSent', { status: 'success', groupName: data.groupName });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const port = process.env.PORT || 10000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
=======
// WebSocket connection
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Handle the 'buzz' event from the client
  socket.on('buzz', (payload) => {
    console.log('Buzz received:', payload);

    // Ensure payload is valid
    if (Array.isArray(payload) && payload.length > 0) {
      // Broadcast to all clients except the sender
      socket.broadcast.emit('buzz', payload);
    } else {
      console.warn('Invalid buzz payload:', payload);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`A user disconnected: ${socket.id}`);
  });
});

// Test endpoint to check if server is running
app.get('/', (req, res) => {
  res.send('Buzzur server is running.');
});

// Buzz API endpoint (e.g., triggered from frontend)
app.post('/send-buzz', (req, res) => {
  const { to, from, group } = req.body;

  // Simple validation of the request
  if (!to || !Array.isArray(to) || to.length === 0) {
    return res.status(400).json({ success: false, message: 'Recipient list is required.' });
  }
  if (!from || !group) {
    return res.status(400).json({ success: false, message: 'Sender and group information are required.' });
  }

  console.log(`Buzz sent from ${from} to ${to.join(', ')} in group "${group}"`);

  // Here you could trigger the Socket.IO buzz event as well if needed
  io.emit('buzz', { to, from, group });

  res.status(200).json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
});
