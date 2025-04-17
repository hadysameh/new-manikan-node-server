const express = require('express');
const { getAll, getOne, update } = require('../controllers/armatureController');
const { getAll: getArmatureBones } = require('../controllers/boneController');

const armatureRouter = express.Router();

armatureRouter.get('/', getAll);
armatureRouter.get('/:id', getOne);
armatureRouter.patch('/:id', update);
armatureRouter.get('/:armatureId/bones', getArmatureBones);

module.exports = armatureRouter;
