const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // ✅ Import CORS

const app = express();
const server = http.createServer(app);

// ✅ Enable CORS and allow your frontend domain
app.use(cors({
  origin: 'https://diaahuss.github.io',
  methods: ['GET', 'POST'],
  credentials: true
}));

// ✅ Allow CORS for Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'https://diaahuss.github.io',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Your existing socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('buzz', (data) => {
    console.log('Buzz sent to group:', data);
    io.emit('buzz', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
