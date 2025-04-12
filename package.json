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

// Mock database (you'll later replace this with actual DB logic)
let users = [];
let groups = [];

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle the buzz event
  socket.on('buzz', (groupId, message) => {
    console.log(`Buzz received for group ${groupId}: ${message}`);
    // You can send the buzz to all members of the group, or to all clients
    io.emit('buzz', { groupId, message });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Login route
app.post('/login', (req, res) => {
  const { phone, password } = req.body;
  const user = users.find(u => u.phone === phone && u.password === password);
  if (user) {
    return res.json({ success: true, user });
  }
  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

// Signup route
app.post('/signup', (req, res) => {
  const { name, phone, password } = req.body;
  const existingUser = users.find(u => u.phone === phone);
  if (existingUser) {
    return res.status(400).json({ success: false, message: "User already exists" });
  }
  const newUser = { id: users.length + 1, name, phone, password };
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

// Add user to group route
app.post('/groups/:groupId/add', (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  const group = groups.find(g => g.id === parseInt(groupId));
  if (!group) {
    return res.status(404).json({ success: false, message: "Group not found" });
  }
  if (group.members.includes(userId)) {
    return res.status(400).json({ success: false, message: "User is already a member" });
  }
  group.members.push(userId);
  res.json({ success: true, group });
});

// Remove user from group route
app.post('/groups/:groupId/remove', (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  const group = groups.find(g => g.id === parseInt(groupId));
  if (!group) {
    return res.status(404).json({ success: false, message: "Group not found" });
  }
  group.members = group.members.filter(member => member !== userId);
  res.json({ success: true, group });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
