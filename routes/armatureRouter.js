const express = require('express');
const {
  getAll,
  getOne,
  update,
  remove,
  create,
} = require('../controllers/armatureController');

const armatureRouter = express.Router();

armatureRouter.get('/', getAll);
armatureRouter.get('/:id', getOne);
armatureRouter.post('/', create);
armatureRouter.patch('/:id', update);
armatureRouter.delete('/:id', remove);

module.exports = armatureRouter;
