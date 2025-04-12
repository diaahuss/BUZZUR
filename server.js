const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // Allow all origins for development
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Mock database (for demonstration purposes)
let users = [];
let groups = [];

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for a 'buzz' event and broadcast to all connected clients
  socket.on('buzz', (groupId) => {
    console.log(`Buzz received for group ${groupId}, broadcasting...`);
    io.emit('buzz', { groupId });
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Login route (POST /login)
app.post('/login', (req, res) => {
  const { phone, password } = req.body; // Using phone number for login (you can change to username if needed)
  const user = users.find(u => u.phone === phone && u.password === password);
  
  if (user) {
    return res.json({ success: true, user });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Signup route (POST /signup)
app.post('/signup', (req, res) => {
  const { name, phone, password } = req.body;

  const existingUser = users.find(u => u.phone === phone); // Check if user with the same phone exists
  if (existingUser) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }

  const newUser = { id: users.length + 1, name, phone, password };
  users.push(newUser);

  return res.json({ success: true, user: newUser });
});

// Create group route (POST /groups)
app.post('/groups', (req, res) => {
  const { name, userId } = req.body;

  // Make sure the user exists
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Create a new group with the first member (the creator)
  const newGroup = { id: groups.length + 1, name, members: [userId] };
  groups.push(newGroup);

  return res.json({ success: true, group: newGroup });
});

// Add member to group (POST /groups/:groupId/members)
app.post('/groups/:groupId/members', (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  // Find group and user
  const group = groups.find(g => g.id === parseInt(groupId));
  const user = users.find(u => u.id === userId);

  if (!group) {
    return res.status(404).json({ success: false, message: "Group not found" });
  }
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Add user to group
  group.members.push(userId);

  return res.json({ success: true, group });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
