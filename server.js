const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Allow GitHub Pages to connect
const io = new Server(server, {
  cors: {
    origin: "https://diaahuss.github.io", // your frontend origin
    methods: ["GET", "POST"]
  }
});

// Basic route just to confirm server is alive
app.get("/", (req, res) => {
  res.send("BUZZUR server is running!");
});

const PORT = process.env.PORT || 10000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle WebSocket events
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("buzz", (data) => {
    console.log("Buzz received:", data);
    // Broadcast the buzz event to all clients except sender
    socket.broadcast.emit("buzz", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
