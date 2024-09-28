const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('uncaught exception, shutting down ....');
  console.log(err.message);
}); // this handler should be in the top to catch exceptions;

dotenv.config({ path: './config.env' }); // it takes an object and should be before requiring our app
//  to read the configuration file

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
// this a promise
mongoose.connect(DB).then(() => {
  console.log('DB is connected');
});

// wil log the environment variable which is development
// console.log(app.get('env'));
//console.log(process.env);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

// unhandled rejection this will handle any promise rejection which was not handled
process.on('unhandledRejection', (err) => {
  console.log('unhandled rejection, shutting down ....');
  console.log(err);

  //process.exit(1); // to end the application
  // this will immediately abort  all requests thata re currently running or pending
  // 0 means success
  // 1 means uncaught exception
  // wee need to end the app gracefully
  server.close(() => process.exit(1)); // this will give the server the time to finish all the requests pendings or bieng handled
});

process.on('SIGTERM', () => {
  console.log('SEGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('process terminated');
  });
});
