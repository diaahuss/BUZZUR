// server.js
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your actual credentials
const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const authToken = 'your_auth_token';
const client = twilio(accountSid, authToken);
const twilioNumber = '+1YOUR_TWILIO_NUMBER';

app.post('/send-buzz', async (req, res) => {
  const { phoneNumbers, message } = req.body;

  try {
    for (const number of phoneNumbers) {
      await client.messages.create({
        body: message || 'BUZZ!',
        from: twilioNumber,
        to: number
      });
    }
    res.send({ success: true, message: 'Buzz sent!' });
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
