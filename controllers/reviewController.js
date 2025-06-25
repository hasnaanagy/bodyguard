const { Guard } = require('../models/User');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const APIFeaturs = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

// @desc    Get all reviews
// @route   GET /api/v1/reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const apiFeatures = new APIFeaturs(Review.find().populate('user', 'name').populate('guard', 'name'), req.query)
      .filter()
      .limitFields()
      .paginate()
      .sort();
    const reviews = await apiFeatures.query;
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a specific guard
// @route   GET /api/v1/reviews/guard/:guardId
exports.getReviewsByGuard = async (req, res, next) => {
  try {
    const guardId = req.params.guardId;

    // Check if guard exists
    const guard = await Guard.findById(guardId);
    if (!guard) throw new AppError('Guard not found', 404);
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
    next(err);
  }
};

// @desc    Create review after booking
// @route   POST /api/v1/reviews
exports.createReview = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { rating, review } = req.body;
    console.log('Current User:', req.user);

    // Check booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.user.toString() !== req.user.id) throw new AppError('You are not allowed to review this booking', 403);

    // Check if booking is completed
    const now = new Date();
    if (booking.endDate > now) throw new AppError('You can only review after booking has ended', 400);

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
    next(err);
  }
};
