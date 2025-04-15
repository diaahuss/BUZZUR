// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public")); // serve static files

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("buzz", (data) => {
    console.log(`Buzzing group: ${data.group}`);
    console.log("Members: ", data.members);
    // Here you can add logic to send notifications to members
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
