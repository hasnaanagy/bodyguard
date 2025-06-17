const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const carRouter = require('./routes/carRoute');
const app = express();
app.use(express.json());

app.use();
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message,
  });
});

app.use(globalErrorHandler);
module.exports = app;
