require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const admin = require('firebase-admin');
const twilio = require('twilio');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

// Initialize Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.userId = decodedToken.uid;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Handle buzz events
  socket.on('buzz', async (data) => {
    try {
      // Verify user has permission to buzz this group
      const groupDoc = await admin.firestore().collection('groups').doc(data.groupId).get();
      if (!groupDoc.exists || groupDoc.data().owner !== socket.userId) {
        return socket.emit('error', 'Unauthorized');
      }
      
      // Send buzz to selected members
      for (const memberId of data.memberIds) {
        // In a real app, we'd look up the member's socket ID and send to them
        // For now, we'll broadcast to all sockets (simplified)
        io.emit('buzz', {
          groupId: data.groupId,
          groupName: data.groupName,
          fromName: data.fromName,
          toMemberId: memberId
        });
        
        // Optionally send SMS via Twilio
        if (memberId.startsWith('phone_')) {
          const phoneNumber = memberId.replace('phone_', '');
          await twilioClient.messages.create({
            body: `BUZZALERT: You've been buzzed by ${data.fromName} in group ${data.groupName}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
          });
        }
      }
    } catch (error) {
      console.error('Buzz error:', error);
      socket.emit('error', 'Failed to send buzz');
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// REST API endpoints
app.get('/api/groups', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'User ID required' });
    
    const snapshot = await admin.firestore().collection('groups')
      .where('owner', '==', userId)
      .get();
    
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
