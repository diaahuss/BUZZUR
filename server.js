const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend domain in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Mock database
let users = [];
let groups = [];

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('buzz', () => {
    console.log('Buzz received, broadcasting...');
    io.emit('buzz');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    return res.json({ success: true, user });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Signup route
app.post('/signup', (req, res) => {
  const { username, password, phone } = req.body;
  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }
  const newUser = { id: users.length + 1, username, password, phone };
  users.push(newUser);
  res.json({ success: true, user: newUser });
});

// Create group route
app.post('/groups', (req, res) => {
  const { name, userId } = req.body;
  const newGroup = { id: groups.length + 1, name, members: [userId] };
  groups.push(newGroup);
  res.json({ success: true, group: newGroup });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
