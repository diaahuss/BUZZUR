const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('buzz', (data) => {
    console.log('Buzz event received:', data);
    // Emit buzz to all clients in the group
    io.emit('buzz', data); 
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running');
});
