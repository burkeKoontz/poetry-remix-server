'use strict';

const mongoose = require('mongoose');
const poemSchema = new mongoose.Schema({
  // a poem is just a collection of magnets and their locations
  // each magnet belongs to a specific poem
  title: { type: String, required: true },
  magnets: [{content: String, xLocation: Number, yLocation: Number}]
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

poemSchema.set('toObject', {
  virtuals: true,     // include built-in virtual `id`
  versionKey: false,  // remove `__v` version key
  transform: (doc, ret) => {
    delete ret._id; // delete `_id`
  }
});

module.exports = mongoose.model('Poem', poemSchema);