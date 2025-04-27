const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config(); // Import dotenv

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Enable CORS for all origins (for development purposes)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Use the frontend URL from the .env file or allow all origins
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'], // Allow specific headers
}));
app.use(express.json()); // To parse JSON requests

// Set up Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*', // Use environment variable or fallback to '*'
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  },
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Handle 'buzz' event
  socket.on('buzz', (payload) => {
    try {
      console.log('Buzz received via socket:', payload);

      if (payload && Array.isArray(payload.to) && payload.to.length > 0) {
        socket.broadcast.emit('buzz', payload); // Broadcast to other users
        console.log('Buzz broadcasted to others.');
      } else {
        console.warn('Invalid payload received:', payload);
      }
    } catch (error) {
      console.error('Error handling buzz event:', error);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Root route to check if the server is running
app.get('/', (req, res) => {
  res.send('Buzzur server is running.');
});

// Login API endpoint (to handle login)
app.post('/api/login', (req, res) => {
  const { phoneNumber, password } = req.body;

  // Example login logic (replace this with actual logic later)
  if (phoneNumber === 'testPhone' && password === 'testPassword') {
    // Successful login response
    return res.status(200).json({ success: true, message: 'Login successful' });
  } else {
    // Failed login response
    return res.status(401).json({ success: false, message: 'Invalid phone number or password' });
  }
});

// Buzz API endpoint to handle buzz notifications
app.post('/send-buzz', (req, res) => {
  const { to, from, group } = req.body;

  try {
    // Validate input
    if (!Array.isArray(to) || to.length === 0) {
      return res.status(400).json({ success: false, message: 'Recipient list is required.' });
    }
    if (!from || !group) {
      return res.status(400).json({ success: false, message: 'Sender and group information are required.' });
    }

    console.log(`Buzz sent from ${from} to ${to.join(', ')} in group "${group}"`);

    // Emit buzz event to each recipient if their socket exists
    to.forEach((recipient) => {
      // Ensure recipient is valid
      if (recipient) {
        // Emitting 'buzz' to the specific socket ID or user
        io.emit('buzz', { to: recipient, from, group });
        console.log(`Buzz sent to ${recipient}`);
      }
    });

    res.json({ success: true, message: 'Buzz sent successfully!' });

  } catch (error) {
    console.error('Error in /send-buzz route:', error);
    res.status(500).json({ success: false, message: 'Server error while sending buzz.' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Buzzur server listening on port ${PORT}`);
});
