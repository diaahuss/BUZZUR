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

// Enable CORS for all origins
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
    origin: '*', // Allow all origins
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
    methods: ['GET', 'POST']
  }
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
  console.log('A user connected:', socket.id);

  socket.on('buzz', (payload) => {
    console.log('Buzz received:', payload);
    // Broadcast to all clients except the sender
    socket.broadcast.emit('buzz', payload);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Test endpoint
app.get('/', (req, res) => {
  res.send('Buzzur server is running.');
});

// Buzz API endpoint
app.post('/send-buzz', (req, res) => {
  const { to, from, group } = req.body;
  console.log(`Buzz sent from ${from} to ${to.join(', ')} in group "${group}"`);
  res.status(200).json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
>>>>>>> 1e57d4453086b558bb8a04ff23f32cafb32750b8
});
