const app = require('./app.js');
const http = require('http');
const socketIo = require('socket.io');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: 'http://localhost:5173', // React app's  URL
    methods: ['GET', 'POST'],
  },
});

global.io = io;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// const server = app.listen(port, () => {
//   console.log(`server is running  in ${process.env.NODE_ENV} on port ${port}`);
// });

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message, { err });
  server.close(() => {
    process.exit(1);
  });
});
