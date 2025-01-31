const express = require('express');
const {
  getAll,
  getOne,
  update,
  remove,
  create,
} = require('../controllers/boneController');

const boneRouter = express.Router();

boneRouter.get('/', getAll);
boneRouter.get('/:id', getOne);
boneRouter.post('/', create);
boneRouter.patch('/:id', update);
boneRouter.delete('/:id', remove);

module.exports = boneRouter;
