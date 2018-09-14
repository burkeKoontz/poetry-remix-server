'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');

router.get('/', (req, res, next) => {
  User
    .find()
    .sort({ updatedAt: 'desc' })
    .then(users => {
      res.json(users);
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

  User
    .findOne({_id: id})
    .then(result => {
      res.json(result);
    })
    .catch(err => {
      next(err);
    });
 
});

router.post('/', (req, res, next) => {
  const {username, password} = req.body;
  
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  // find if one of the fields is not a string
  const notAString = requiredFields.find(field => ((typeof req.body[field]) !== 'string'));

  if (notAString) {
    const err = new Error(`'${notAString}' expected to be a string`);
    err.status = 422;
    return next(err);
  }

  const fieldWithWhitespace = requiredFields.find(field => req.body[field].trim() !== req.body[field]);

  if (fieldWithWhitespace) {
    const err = new Error(`'${fieldWithWhitespace}' cannot have whitespace before or after`);
    err.status = 422;
    return next(err);
  }

  const tooSmallUsername = username.length < 1 ? true : false;
  if (tooSmallUsername) {
    const err = new Error('Username must be greater than one character');
    err.status = 422;
    return next(err);
  }

  const invalidPasswordLength = password.length < 8 || password.length > 72 ? true : false;
  if (invalidPasswordLength) {
    const err = new Error('Passwords must be between 8 and 72 characters');
    err.status = 422;
    return next(err);
  }

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
      };
      return User.create(newUser);
    })
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('That username is taken already');
        err.status = 400;
      }
      next(err);
    });

});

module.exports = router;