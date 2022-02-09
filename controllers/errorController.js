const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate Fields value : ${value}, this already exists`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input data. Erros : ${errors.join('. ')}`;
  return new AppError(message, 404);
};

// If token is modified in between the server and client
const handleJWTError = () => new AppError('Invalid token, dont mess with servers..', 401);

// Tf token is expired
const handleJWTExpError = () => new AppError('Session Expired, login again to continue', 401);

// Send all the error stack, message everything in development
const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// If somethong went wrong in production
const sendProdErr = (err, res) => {
  // Operationl err, this is sent to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // if there is some unknown error then we do not want to send that to the client
  } else {
    // First we log the error message in the console
    console.error('Error🙄', err.message);
    // Then send a very generic response to the client
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong💤',
    });
  }
};
/**
 * 
 * @param {GlobalErrorHandler} err 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * Global express error handling middleware..
 * 
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpError();
    sendProdErr(error, res);
  }
};
