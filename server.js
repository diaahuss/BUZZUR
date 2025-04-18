const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files (index.html, script.js, style.css, buzz.mp3, etc.)
app.use(express.static(path.join(__dirname)));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("buzz", (data) => {
    console.log("Buzz triggered:", data);
    io.emit("buzzed", data); // emit to all clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const port = process.env.PORT || 10000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
