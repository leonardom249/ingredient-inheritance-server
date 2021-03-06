'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const recipeRouter = require('./routers/recipe-router');
const userRouter = require('./routers/user-router');
const authRouter = require('./routers/authentication');
const {jwtStrategy, localStrategy} = require('./strategies/auth-strategies');



const { PORT, CLIENT_ORIGIN, JWT_SECRET, JWT_EXPIRY } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');
const bodyParser = require('body-parser');

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

app.use(bodyParser.json());

app.use('/api', recipeRouter);
app.use('/api', userRouter);
app.use('/api', authRouter);

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
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
  dbConnect();
  runServer();
}

module.exports = { app };
