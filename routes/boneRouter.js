const express = require('express');
const { getAll, update } = require('../controllers/boneController');

const boneRouter = express.Router();

boneRouter.patch('/:boneId', update);

module.exports = boneRouter;
