
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

io.on('connection', socket => {
  console.log('Client connected');
  socket.on('buzz', data => {
    socket.broadcast.emit('buzz', data);
  });
});

app.post('/send-buzz', (req, res) => {
  const { message } = req.body;
  io.emit('buzz', { message });
  res.status(200).send({ status: 'Buzz sent' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
