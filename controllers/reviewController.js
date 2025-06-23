const Review = require('../models/Review');
const Booking = require('../models/bookingModel');
const mongoose = require('mongoose');

// @desc    Get all reviews
// @route   GET /api/v1/reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// @desc    Get reviews for a specific guard
// @route   GET /api/v1/reviews/guard/:guardId
exports.getReviewsByGuard = async (req, res) => {
  try {
    const guardId = req.params.guardId;

    // جلب التقييمات للحارس
    const reviews = await Review.find({ guard: guardId });

    // حساب المتوسط وعدد التقييمات عبر aggregation
    const stats = await Review.aggregate([
      { $match: { guard: new mongoose.Types.ObjectId(guardId) } },
      {
        $group: {
          _id: '$guard',
          avgRating: { $avg: '$rating' },
          nRating: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
        ratingsSummary: stats[0] || { avgRating: 0, nRating: 0 },
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// @desc    Create review after booking
// @route   POST /api/v1/reviews
exports.createReview = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { rating, review } = req.body;

    // Check booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.user.toString() !== req.user.id) throw new Error('You are not allowed to review this booking');

    // Check if booking is completed
    const now = new Date();
    if (booking.endDate > now) throw new Error('You can only review after booking has ended');

    // Create review
    const newReview = await Review.create({
      rating,
      review,
      user: req.user.id,
      guard: booking.guard,
      booking: bookingId,
    });

    res.status(201).json({
      status: 'success',
      data: { review: newReview },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
