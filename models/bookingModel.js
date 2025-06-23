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

// ! Query middleware

bookingSchema.pre(/^save/, async function (next) {
  const book = await this.populate('guard user vehicle');
  console.log('🚀 ~ book:', book);

  // checking if user book vehicle
  if (book.hasOwnProperty('vehicle')) {
    this.price = book.guard.price + book.vehicle?.price;
  } else this.price = book.guard.price;
  this.finalPrice = this.price - this.price * (this.discount / 100);
  next();
});

// ! Static methods

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
