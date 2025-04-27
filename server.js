const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://buzzur.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Socket.IO with enhanced configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'https://buzzur.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  }
});

// Database simulation (replace with real DB)
const users = [
  { phone: '1234567890', password: 'password123', name: 'Test User' }
];

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);
  // In a real app, verify JWT here
  next();
}

// WebSocket connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('buzz', (payload) => {
    try {
      console.log('Buzz received:', payload);
      if (payload?.groupId) {
        socket.to(payload.groupId).emit('buzz', payload);
      }
    } catch (error) {
      console.error('Buzz error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.post('/api/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = users.find(u => u.phone === phoneNumber && u.password === password);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid phone number or password' 
      });
    }

    // In a real app, generate JWT token here
    const token = 'generated-jwt-token';
    
    res.json({ 
      success: true,
      token,
      user: {
        phone: user.phone,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    
    if (users.some(u => u.phone === phone)) {
      return res.status(409).json({ 
        success: false, 
        message: 'Phone number already exists' 
      });
    }

    // In real app, hash password before saving
    users.push({ name, phone, password });
    
    res.status(201).json({ 
      success: true,
      message: 'User created successfully' 
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS configured for: ${process.env.FRONTEND_URL || 'https://buzzur.onrender.com'}`);
});
