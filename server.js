const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust this in production
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('BUZZUR backend is running!');
});

app.post('/send-buzz', (req, res) => {
  const { members } = req.body;
  console.log('Buzzing members:', members);

  io.emit('receive-buzz', members); // Broadcast to all connected clients
  res.status(200).json({ success: true, message: 'Buzz sent' });
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('buzz', (data) => {
    console.log('Buzz event received from client:', data);
    socket.broadcast.emit('receive-buzz', data.members);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
