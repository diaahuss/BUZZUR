const express = require('express');
const path = require('path');
const app = express();
const port = 3000; // Hardcoded for testing

// Middleware to serve static files
app.use(express.static(__dirname, {
  extensions: ['html', 'htm'] // Allow serving .html files
}));

// Explicit route for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
