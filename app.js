'use strict';
const path = require('path');
const express = require('express');
const cors = require('cors');
const globalErrorHandler = require('./utils/globalErrorHandler.js');
const armatureRouter = require('./routes/armatureRouter.js');
const boneRouter = require('./routes/boneRouter.js');
const configRouter = require('./routes/configRouter.js');

const app = express();

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: '10kb' }));

app.use('/*', (req, res, next) => {
  next();
});

app.use('/api/armature', armatureRouter);
app.use('/api/bone', boneRouter);
app.use('/api/config', configRouter);

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'react-ui', 'dist');
app.use(express.static(distPath));

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/react-ui/dist/index.html');
});

app.use(globalErrorHandler);
// emitArduinoDataToClients();
module.exports = app;
