const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Add body parser for JSON
app.use(express.json());

// Twilio setup
const twilio = require('twilio');
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const twilioPhone = 'YOUR_TWILIO_PHONE_NUMBER'; // e.g., +1234567890

const client = new twilio(accountSid, authToken);

// 🔔 Test route for sending SMS
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
