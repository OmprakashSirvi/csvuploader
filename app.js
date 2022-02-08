const path = require('path');
const express = require('express');
const morgan = require('morgan');

const userRoutes = require('./routes/userRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json({ limit: '10kb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use('/user', userRoutes);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
