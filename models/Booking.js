const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  guard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guard',
    required: [true, 'Booking must belong to a guard'],
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a client'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please specify end date'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'expired'],
    default: 'pending',
  },
  reasonOfRejection: String,
  location: {
    type: String,
    required: [true, 'Please specify location'],
  },
  notes: String,
  totalPrice: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.index({ guard: 1, startDate: 1 });
bookingSchema.index({ client: 1, status: 1 });

bookingSchema.statics.checkAvailability = async function (guardId, startDate, endDate) {
  const overlappingBookings = await this.find({
    guard: guardId,
    status: 'confirmed',
    $or: [{ startDate: { $lte: endDate }, endDate: { $gte: startDate } }],
  });
  return overlappingBookings.length === 0;
};

module.exports = mongoose.model('Booking', bookingSchema);
