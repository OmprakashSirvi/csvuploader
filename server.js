const mongoose = require('mongoose');
const dotenv = require('dotenv');
// all my enviornoment variables
dotenv.config({ path: './config.env' });
const app = require('./app');

/** 
 * If any uncaught exception in event loop then call this
 */

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message, `\nError : ${err}`);
  process.exit(1);
});

/**
 * Replace <PASSWORD> with the orignal password
 * and connect tot the database
 */
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {})
  .then(() => {
    console.log('db connection success!!!');
  })
  .catch((err) => {
    if (err) {
      console.log('There was some error!!!🥵');
      console.log(err);
    }
  });

/**
 * If i am in development then set host to localhost
 */
const port = process.env.PORT || 8080;
if (process.env.NODE_ENV === 'development') process.env.HOST = "127.0.0.1"
const host = process.env.HOST

// console.log(process.env.HOST)

const server = app.listen(port, host, () => {
  console.log(`App is up and running at : http://${host}:${port}`)
  // console.log(`App running on port ${port}...`);
});
// const host = '127.0.0.1';
// const server = app.listen(port, host, () => {
//   console.log(`App is up and running at : http://${host}:${port}`);
// });

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION😫');
  server.close(() => {
    process.exit(1);
  });
});
