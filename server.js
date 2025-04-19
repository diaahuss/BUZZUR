require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Use environment variables for Twilio credentials
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH;
const twilioPhone = process.env.TWILIO_PHONE;

const client = twilio(accountSid, authToken);

// 🟡 Test route (optional)
app.get('/', (req, res) => {
  res.send('BUZZUR Server is running');
});

// 📲 Buzz endpoint
app.post('/send-buzz', async (req, res) => {
  const { phoneNumbers, message } = req.body;

  if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0 || !message) {
    return res.status(400).json({ error: 'Missing phone numbers or message' });
  }

  try {
    const results = await Promise.all(
      phoneNumbers.map(number =>
        client.messages.create({
          body: message,
          from: twilioPhone,
          to: number
        })
      )
    );

    res.json({ success: true, message: 'Buzz sent!', details: results });
  } catch (err) {
    console.error('Error sending buzz:', err.message);
    res.status(500).json({ error: 'Failed to send buzz', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 BUZZUR server running on http://localhost:${PORT}`);
});
