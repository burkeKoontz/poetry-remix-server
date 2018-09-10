'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fetch = require('node-fetch');

const { PORT, CLIENT_ORIGIN, POETRY_API_BASE_URL } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/poems', (req, res, next) => {
  const searchByAuthor = req.query.byAuthor;
  const searchByTitle = req.query.byTitle;
  let baseURL;
  
  if (searchByAuthor) {
    baseURL = `${POETRY_API_BASE_URL}/author/${searchByAuthor}`;
  } else if (searchByTitle) {
    baseURL = `${POETRY_API_BASE_URL}/title/${searchByTitle}`;
  }

  fetch(baseURL)
    .then(poetryResponse => poetryResponse.json())
    .then(data => res.json(data))
    .catch(err => next(err));
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  // dbConnect();
  runServer();
}

module.exports = { app };
