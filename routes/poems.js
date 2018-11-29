'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Poem = require('../models/poem');
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

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
  
  const { title, magnets, userId} = req.body;

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const magnetArray = Object.keys(magnets).map(magnet => magnets[magnet]);
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

router.put('/:id', jwtAuth, (req, res, next) => {
  const idOfItemToUpdate = req.params.id;
 
  if (req.body.id !== req.params.id) {
    const err = new Error('Id in parameters does not match id in request body');
    err.status = 400;
    return next(err);
  }
  // const userId = req.user.id;
  // want to update magnets or title

  // , userId: req.user.id in filter
  const updateItem = {};
  const keyArray = Object.keys(req.body);
  // magnets, title, userId, id in body
  keyArray.forEach(key => updateItem[key] = req.body[key]);

  if (!(req.body.title)) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if(req.user.id !== req.body.userId) {
    const message = 'Cannot change a poem that is not yours';
    return res.status(400).send(message);
  }

  if (!(keyArray.length)) {
    const message = 'Nothing sent to update';
    return res.status(400).send(message);
  }
  
  if (!mongoose.Types.ObjectId.isValid(idOfItemToUpdate)) {
    const err = new Error('The `poem id` is not valid');
    err.status = 400;
    return next(err);
  }

  Poem.findOneAndUpdate({_id: idOfItemToUpdate}, updateItem, {new : true})
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
});


router.delete('/:id', (req, res, next) => {
  const idOfItemToRemove = req.params.id;
  // put userId back in the filter if you know what's happening
  // add jwt authentication in here at some point
  Poem
    .findOneAndRemove({_id : idOfItemToRemove})
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });

});


module.exports = router;