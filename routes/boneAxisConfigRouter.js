const express = require('express');
const {
  getAll,
  getOne,
  update,
  remove,
  create,
} = require('../controllers/boneAxisConfigController');

const boneAxisConfigRouter = express.Router();

boneAxisConfigRouter.get('/', getAll);
boneAxisConfigRouter.get('/:id', getOne);
boneAxisConfigRouter.post('/', create);
boneAxisConfigRouter.patch('/:id?', update);
boneAxisConfigRouter.delete('/:id', remove);

module.exports = boneAxisConfigRouter;
