const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
console.log('here');
// Handle client connections
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

setInterval(() => {
  try {
    const data = fs.readFileSync('./socketDataToSend.json');
    // console.log({ data });
    const dataToSend = JSON.parse(data);
    io.emit('arduinoData', dataToSend);
  } catch (error) {
    console.log(error);
  }
}, 1000);
