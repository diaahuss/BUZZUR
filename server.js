require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const twilio = require('twilio');

const PORT = process.env.PORT || 3000;
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // to serve index.html, script.js, styles.css

app.post('/send-buzz', async (req, res) => {
  const { phoneNumbers, message } = req.body;

  try {
    for (const number of phoneNumbers) {
      await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: number
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Buzz send failed:', error.message);
    res.status(500).json({ success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
