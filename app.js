const express = require('express');
const AppError = require('./utils/appError');
const bookingRoutes = require('./routes/bookingRoutes');
const globalErrorHandler = require('./controllers/errorController');
const carRouter = require('./routes/carRoute');
const authRoutes = require('./routes/authRoute');
const bookingRouter = require('./routes/bookingRoutes');
const guardRouter = require('./routes/guardRoute');
const reviewRouter = require('./routes/reviewRoute');
const userRouter = require('./routes/userRoute');
const morgan = require('morgan');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/cars', carRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/guards', guardRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/users', userRouter);

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
