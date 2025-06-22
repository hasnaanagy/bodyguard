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
    type: Date,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
  },
  guard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guard',
    required: [true, 'Guard is required'],
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required'],
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: false,
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
  },
  discount: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
    required: [true, 'Final price is required'],
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
