require('dotenv').config(); // Load environment variables

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Add body parser for JSON
app.use(express.json());

// Twilio setup
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const apiKey = process.env.TWILIO_API_KEY_SID;
const apiSecret = process.env.TWILIO_API_KEY_SECRET;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = require('twilio')(apiKey, apiSecret, { accountSid });

// Check if Twilio loaded correctly
console.log('Twilio loaded with:', { accountSid, apiKey, apiSecret, twilioPhone });

// Test route for sending SMS
app.post('/api/test-sms', async (req, res) => {
  const { to, message } = req.body;
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhone,
      to
    });
    res.status(200).json({ success: true, sid: result.sid });
  } catch (error) {
    console.error('Twilio error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static files from current directory
app.use(express.static(__dirname));

// Route all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log('Serving files from:', __dirname);
});
