'use strict';

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const Poem = require('../models/poem');

const seedPoems = require('../db/seed/poems');


mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Poem.insertMany(seedPoems);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });