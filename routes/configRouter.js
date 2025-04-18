const express = require('express');
const { getOne, update } = require('../controllers/configController');

const configRouter = express.Router();

configRouter.get('/', getOne);
configRouter.put('/', update);

module.exports = configRouter;
