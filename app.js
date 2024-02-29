const path = require('path');
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimiter = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const helmet = require('helmet');
const hpp = require('hpp');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const paymentRouter = require('./routes/paymentRoute');
const AppError = require('./utils/appError');
const app = express();

console.log(process.env.NODE_ENV);

// GLOBAL MIDDLEWARES
app.use('/uploads', express.static('uploads'));

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Limit request from same API
const limiter = rateLimiter({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , please try again in a hour ',
});
app.use('/api', limiter);

// body paser , reading data from body to req.body
app.use(express.json({ limit: '100kb' })); // read data upto 100kb

app.use(cookieParser());

// Data sanitization against NoSql query injection
app.use(mongoSanitize());

// Data sanitization against XSS (cross site )
app.use(xss());

// prevent paramater pollution
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
  })
);

//routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/payment', paymentRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server `, 404));
});

module.exports = app;
