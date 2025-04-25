// server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST']
  }
});

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
});
