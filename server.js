// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const twilio = require('twilio');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(cors());
app.use(express.json());

app.post('/send-buzz', async (req, res) => {
  const { phoneNumbers, message } = req.body;

  if (!Array.isArray(phoneNumbers) || !message) {
    return res.status(400).json({ success: false, error: 'Invalid request body' });
  }

  try {
    for (const phone of phoneNumbers) {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Twilio Error:', err);
    res.status(500).json({ success: false, error: 'Failed to send buzz' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
