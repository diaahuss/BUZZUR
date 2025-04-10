const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow requests from anywhere — change this to your domain in production
  }
});

app.use(cors());
app.use(express.json());

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When someone sends a buzz
  socket.on('buzz', () => {
    console.log('Buzz received. Broadcasting...');
    io.emit('buzz'); // Send buzz to all connected users
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Route to test the server
app.get('/', (req, res) => {
  res.send('BuzzUR server is running!');
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
