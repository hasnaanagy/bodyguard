const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
  },
  guard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Guard is required'],
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client is required'],
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
  },
  discount: {
    type: Number,
    default: 0,
  },
  priceAfterDiscount: {
    type: Number,
    required: [true, 'Price after discount is required'],
  },
  status: {
    type: String,
    enum: ['pending', 'upcoming', 'in progress', 'finished'],
    default: 'pending',
    required: [true, 'Booking status is required'],
  },
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
