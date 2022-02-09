const path = require('path');
const express = require('express');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '10kb' }));

/** 
 * console logger middleware for development
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

/**
 * Base Route
 * Send basic response back to the client (its runnning!!)
 */
app.get('/', (req, res) => {
  res.send('Hello World!');
  // res.status(200);
});

/**
 * Route for user all the api functionality is here
 */
app.use('/user', userRoutes);

/**
 * Send error if the route is different 
 */
app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 500));
});

/**
 * Express global error handler
 */
app.use(globalErrorHandler);

/**
 * Export app to server
 */
module.exports = app;
