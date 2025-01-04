const { io } = require('socket.io-client');

const serverUrl = 'http://localhost:3000'; // Replace with your server URL and port
const socket = io(serverUrl);

// When the connection is established
socket.on('connect', () => {
  console.log('Connected to the Socket.IO server');

  // Send a message to the server
  socket.emit('message', 'Hello from Node.js client!');
});

// Listen for a 'data' event from the server
socket.on('data', (data) => {
  console.log('Received data from server:', data);
});

socket.on('arduinoData', (data) => {
  console.log('arduinoData data from server:', data);
});
// Listen for a 'disconnect' event
socket.on('disconnect', () => {
  console.log('Disconnected from the server');
});

// Handle connection errors
socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});
