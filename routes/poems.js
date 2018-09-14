'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Poem = require('../models/poem');

router.get('/', (req, res, next) => {
  let filter = {};
  if (req.query.userId) {
    filter.userId = req.query.userId;
  }
  // help
  Poem
    .find(filter)
    .sort({ updatedAt: 'desc' })
    .then(poems => {
      res.json(poems);
    })
    .catch(error => {
      next(error);
    });
});

router.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Poem
    .findOne({_id: id})
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
 
});

router.post('/', (req, res, next) => {
  console.log(req.body);
  
  const { title, magnets, userId} = req.body;

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const magnetArray = Object.keys(magnets).map(magnet => magnets[magnet]);
  console.log(magnetArray);
  const newPoem = {title, magnets: magnetArray, userId};
  Poem.create(newPoem)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });

});


module.exports = router;