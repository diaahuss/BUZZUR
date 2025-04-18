// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("buzz", (data) => {
    const { groupId, members } = data;
    console.log(`Buzz received for group ${groupId} with ${members.length} members.`);

    // Emit buzzed event to all connected clients with the group and member info
    io.emit("buzzed", { groupId, members });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
