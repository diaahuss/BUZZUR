const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 10000;

// Serve static files from root directory
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('buzz', (data) => {
    console.log('Buzz sent:', data);
    io.emit('buzzed', data); // broadcast buzz
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
