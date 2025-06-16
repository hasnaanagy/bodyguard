const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const authRoute = require('./routes/authRoute');
const app = express();
app.use(express.json());

app.use('/api/auth', authRoute);

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
