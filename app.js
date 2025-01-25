'use strict';
const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const calibrationRouter = require('./routes/calibrationRouter.js');
const db = require('./db/index');
const eventEmitter = require('./utils/EventEmitter.js');
const globalErrorHandler = require('./utils/globalErrorHandler.js');
const armatureRouter = require('./routes/armatureRouter.js');
const boneAxisConfigRouter = require('./routes/boneAxisConfigRouter.js');

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
  console.log(req.originalUrl);
  next();
});

app.use('/api', calibrationRouter);

app.use('/api/armature', armatureRouter);
app.use('/api/boneaxisconfig', boneAxisConfigRouter);

// Serve static files from the dist directory
const distPath = path.join(__dirname, 'react-ui', 'dist');
app.use(express.static(distPath));

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/react-ui/dist/index.html');
});

app.use(globalErrorHandler);

module.exports = app;
