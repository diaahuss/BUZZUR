require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve frontend files

app.post('/send-buzz', async (req, res) => {
  const { phoneNumbers, message } = req.body;
  try {
    await Promise.all(
      phoneNumbers.map(number =>
        client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE,
          to: number
        })
      )
    );
    io.emit('buzz');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

io.on('connection', socket => {
  console.log('Client connected');
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
