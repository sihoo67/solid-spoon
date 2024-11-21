const express = require('express');
const http = require('http');
const socketIo = require('socket.io');  // ws 대신 socket.io 사용

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 5000;
app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A new client connected!');
  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });
  socket.emit('message', 'Welcome to the Omok game!');
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
