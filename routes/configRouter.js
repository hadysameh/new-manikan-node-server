const express = require('express');
const { getOne, create } = require('../controllers/configController');

const configRouter = express.Router();

configRouter.get('/', getOne);
configRouter.post('/', create);

module.exports = configRouter;
