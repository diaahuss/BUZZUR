const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'buzzur' folder
app.use(express.static('buzzur'));

// Basic endpoint to handle POST requests for sending a "buzz" alert
app.post('/send-buzz', (req, res) => {
  io.emit('buzz', { message: 'Buzz sent to all members!' }); // Broadcast the buzz
  res.send({ success: true });
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

