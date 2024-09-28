/* eslint-disable import/no-extraneous-dependencies */
// third party package
const express = require('express');
const path = require('path');
const compression = require('compression');
// third party middleware
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');
const reviewRoutes = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

// creating a server
const app = express();

// app.enable('trust proxy');
//vid 174
// to tell express what engines we will be using
// we don't need to install pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// global middlewares

// using built in middleware for serving static files : html , class
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet()); // should be at the top of middlewares

// Set security HTTP headers
app.use(helmet()); // should be at the top of middlewares

// Set security HTTP headers
app.use(helmet()); // should be at the top of middlewares

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://js.stripe.com'],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      imgSrc: [
        "'self'",
        'data:',
        'https://res.cloudinary.com', // Allow images from Cloudinary
      ],
      connectSrc: ["'self'", 'ws://127.0.0.1:60113'], // Include necessary WebSocket URLs
    },
  }),
);

app.use(cors());

app.use(morgan('dev'));

// limit the requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'too many requests from this ip , pleas try again in an hour ',
  skipSuccessfulRequests: true, // Avoid the trust proxy error
}); // this will allow 100 request for same ip in 1 hour
app.use('/api', limiter); // only apply the limiter to the route /api

// body parser to read data fom body req.body
app.use(express.json({ limit: '10kb' }));

// to get the req.cookies
app.use(cookieParser());

//to update user form
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  }),
);

// data sanitizatiopn against no sql query injection
app.use(mongoSanitize());

// data sanitizatiopn against xss from malicious html with js code
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
  // white list means we can use duplicate param of the same field which in this case is duration
); //should be used by the end

//vid 220
app.use(compression());

// test middleware
app.use((req, res, next) => {
  // console.log('hello from the middleware 👋 ');
  next();
});

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/bookings', bookingRouter);

// unhandled routes //////////////////////////////////TODO:
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// middleware to handle errors TODO:
app.use(globalErrorHandler);

module.exports = app;
