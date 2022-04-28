const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const schedule = require('node-schedule');
var multer = require('multer');
// Route Imports
const appRoutesV1 = require('./routes');
const moveBalanceFromEsrowToVendorWallet = require('./jobs/moveBalanceFromEsrowToVendorWallet');
// Development Plugins Import i.e [Logging]
const morgan = require('morgan');

// security imports
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
// const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')


// Error Handling Dependencies
const { errorHandler } = require('./controller/error');
const appError = require('./utils/appError');

// 1) GLOBAL MIDDLEWARES

// Security HTTP headers
app.use(helmet());
// app.use(awsServerlessExpressMiddleware.eventContext())

// Limit the number of requests from a certain ip
// const limter = rateLimit({
//   // 100 requests from same ip in 1 hour
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too Many requests from this IP, please try again in an hour!',
// });

// // Limit the no of request per ip
// app.use('/api', limter);

// Data Sanatization agains noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

//mongodb connection string
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('Done: connected to database');
  })
  .catch(err => {
    console.log(err);
    console.log('connection failed');
  });

app.use(bodyParser.json({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS Functionality
// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept, Authorization',
//   );

//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET, POST, PUT, PATCH, DELETE, OPTIONS',
//   );
//   next();
// });

// app.use(cors());
var whitelist = ['http://localhost:3000', 'http://localhost:3999', 'https://www.merchpals.com', 'https://merchpals.com', 'http://mpals-react.s3-website-us-east-1.amazonaws.com']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions));

app.use('/public', express.static(path.join(__dirname, 'public')));

// 2) Routes
app.use('/', appRoutesV1);

// 3) Error Handeling

// Generate 404 error on from server when the URL not found
app.all('*', (req, res, next) => {
  // generate the new error from the error class
  next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Handle errors of application
app.use(errorHandler);


// Folowing rules triggers moveBalanceFromEsrowToVendorWallet at the start of every day
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.tz = 'Etc/UTC';

// const startTime = new Date(Date.now() + 5000);
// const endTime = new Date(startTime.getTime() + 5000);
// const job = schedule.scheduleJob(
//   { start: startTime, end: endTime, rule: '*/1 * * * * *' },
//   moveBalanceFromEsrowToVendorWallet,
// );
const job = schedule.scheduleJob(rule, moveBalanceFromEsrowToVendorWallet);

// app.listen(3000, function() {
//   console.log('app started')
// })

module.exports = app;
