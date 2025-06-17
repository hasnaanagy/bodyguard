const express = require('express');
const AppError = require('./utils/appError');
const bookingRoutes = require('./routes/bookingRoutes');
const globalErrorHandler = require('./controllers/errorController');
const app = express();
app.use(express.json());

app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message,
  });
});

app.use('/api/v1/booking', bookingRoutes);
app.use(globalErrorHandler);
module.exports = app;
