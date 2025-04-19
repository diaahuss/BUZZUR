const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*', // allow all origins (adjust in production)
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(bodyParser.json());

// Just confirm server is running
app.get('/', (req, res) => {
  res.send('BUZZUR Server is running.');
});

// Receive buzz via POST
app.post('/send-buzz', (req, res) => {
  const { phones } = req.body;
  console.log('Buzz POST received for phones:', phones);
  
  // Optional: Send to connected clients via socket
  io.emit('buzz', phones);

  // Optional: Save to database / trigger SMS here

  res.status(200).json({ message: 'Buzz sent' });
});

// WebSocket Buzz from frontend
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('buzz', (phones) => {
    console.log('Buzz via socket for phones:', phones);
    // Optionally re-emit or log
    io.emit('buzz', phones);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`BUZZUR server running on port ${PORT}`);
});
