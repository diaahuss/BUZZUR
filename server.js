const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve ALL files from the current directory
app.use(express.static(__dirname));

// Handle page refreshes by sending index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
