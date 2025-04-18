const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['https://diaahuss.github.io', 'https://your-app-name.onrender.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
  },
});

// Use the PORT environment variable or default to 10000
const PORT = process.env.PORT || 10000;

app.use(express.static('public')); // Serve static files from 'public' directory

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('buzz', (data) => {
    console.log('Buzz received:', data);
    io.emit('buzzed', data); // Emit 'buzzed' event to all clients
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Ensure the server listens on 0.0.0.0 and the correct port
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
