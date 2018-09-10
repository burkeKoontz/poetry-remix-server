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
  const authorSearchTerm = req.query.authorSearchTerm;
  const titleSearchTerm = req.query.titleSearchTerm;
  let baseURL;

  if (authorSearchTerm && titleSearchTerm) {
    baseURL = `${POETRY_API_BASE_URL}/author,title/${authorSearchTerm};${titleSearchTerm}`;
  } else if (titleSearchTerm) {
    baseURL = `${POETRY_API_BASE_URL}/title/${titleSearchTerm}`;
  } else if (authorSearchTerm) {
    baseURL = `${POETRY_API_BASE_URL}/author/${authorSearchTerm}`;
  }

  console.log(baseURL);

  fetch(baseURL)
    .then(poetryResponse => poetryResponse.json())
    .then(data => res.json(data))
    .catch(err => next(err));
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    // console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
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
