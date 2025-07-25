const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Review must have a rating'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    guard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a guard'],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Review must be linked to a booking'],
      unique: true, // كل حجز يتقيم مرة واحدة بس
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-populate user and guard info
reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'user', select: 'name profileImage' })
    .populate({ path: 'guard', select: 'name profileImage' })
    .populate({ path: 'booking', select: 'startDate endDate ' });
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
