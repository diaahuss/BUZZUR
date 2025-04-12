{
  "name": "buzzer-server",
  "version": "1.0.0",
  "description": "BUZZUR App - Backend",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"  // If you use nodemon for development
  },
  "dependencies": {
    "express": "^4.17.1",
    "socket.io": "^4.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"  // Optional, for dev purposes
  },
  "engines": {
    "node": "14.x"  // Specify Node version (optional)
  }
}
