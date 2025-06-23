const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    guard: {
      ref: 'Guard',
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user: {
      ref: 'Client',
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    vehicle: {
      ref: 'Car',
      type: mongoose.Schema.Types.ObjectId,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    finalPrice: {
      type: Number,
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
