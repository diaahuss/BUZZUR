const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve all files from the current folder
app.use(express.static(__dirname));

// Handle all routes by sending index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
