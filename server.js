const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // To serve HTML/CSS/JS

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Listen for buzz events
  socket.on('sendBuzz', ({ to, message }) => {
    console.log('Buzzing:', to, message);

    // Broadcast buzz to all connected clients
    io.emit('buzzReceived', message); 
    // In future: only buzz selected sockets based on user auth
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
