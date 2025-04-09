// Import required packages
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

// Initialize the app
const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Enable JSON parsing for incoming requests
app.use(express.json());

// Replace with your actual Twilio credentials
const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Your Twilio SID
const authToken = 'your_auth_token'; // Your Twilio Auth Token
const twilioNumber = '+1YOUR_TWILIO_NUMBER'; // Your Twilio phone number

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Handle the POST request to send a buzz
app.post('/send-buzz', async (req, res) => {
  const { phoneNumbers, message } = req.body;

  // Ensure phoneNumbers is an array and message is set
  if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
    return res.status(400).json({ success: false, error: 'No phone numbers provided' });
  }

  if (!message) {
    return res.status(400).json({ success: false, error: 'No message provided' });
  }

  try {
    // Send a message to each phone number
    for (const number of phoneNumbers) {
      await client.messages.create({
        body: message, // The message text
        from: twilioNumber, // Your Twilio number
        to: number // The recipient's phone number
      });
    }

    // Send a success response back
    res.json({ success: true, message: 'Buzz sent successfully!' });
  } catch (err) {
    // Handle any errors that occur during the message sending
    res.status(500).json({ success: false, error: err.message });
  }
});

// Default route to check if the server is running
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Start the server on a given port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
