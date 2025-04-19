const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Modern Socket.IO import
const cors = require('cors');

// Initialize Express and HTTP Server
const app = express();
const server = http.createServer(app);

// Enable CORS for all origins
app.use(cors());

// Serve static files (optional)
app.use(express.static('public'));

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins - adjust if needed for security
    methods: ['GET', 'POST']
  }
});

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
});
