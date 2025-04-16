// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (index.html, script.js, style.css, buzz.mp3, etc.)
app.use(express.static(path.join(__dirname)));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("buzz", (member) => {
    console.log(`Buzz sent to: ${member.name || "Unknown"} (${member.phone})`);
    // Optionally emit buzz to all connected clients
    io.emit("buzz", member);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
