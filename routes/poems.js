'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Poem = require('../models/poem');

router.post('/', (req, res, next) => {
  console.log(req.body);
  
  const { title, magnets} = req.body;
  Poem.create()
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