const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
app.use(express.json());

// app.all('*', (req, res, next) => {
//   const err = new AppError(`can not find ${req.originalUrl} on this server`, 404);
//   next(err);
// });

app.use(globalErrorHandler);
module.exports = app;
