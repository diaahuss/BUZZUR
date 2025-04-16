const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Allow CORS from all origins or restrict to your frontend domain
app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*", // Replace * with your frontend URL for security in production
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("buzz", (member) => {
    console.log("Buzz received for:", member);

    // Confirm buzz to the sender
    socket.emit("buzz-confirmation", member);

    // Optional: broadcast buzz to other users (if needed)
    // socket.broadcast.emit("buzz-received", member);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Optional basic root endpoint
app.get("/", (req, res) => {
  res.send("Buzzur server is running");
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
