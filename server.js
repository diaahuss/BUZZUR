require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const bcrypt = require('bcryptjs');
const app = express();

// Mock database (replace with real DB)
const users = [
  {
    phone: "1234567890",
    password: "$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H3d7JYF5JdwHtGfQXKGm5Z4.ByO" // "test123"
  }
];

app.use(express.json());

// Login endpoint
app.post('/api/login', (req, res) => {
  const { phone, password } = req.body;
  const user = users.find(u => u.phone === phone);
  
  if (!user) return res.status(401).json({ error: "User not found" });
  
  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res.json({ success: true });
  });
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
