const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    guard: {
      ref: 'Guard',
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    vehicle: {
      ref: 'Vehicle',
      type: mongoose.Schema.Types.ObjectId,
    },
    startDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
    },
    endDate: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
    },
    status: {
      type: String,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

// ! Virtual properties
bookingSchema.virtual('duration').get(function () {
  return this.endDate - this.startDate;
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
