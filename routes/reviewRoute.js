const express = require('express');
const reviewController = require('../controllers/reviewController');
const verifyToken = require('../middlewares/verifyToken'); // لو عندك middleware حماية

const router = express.Router();

// Public routes
router.get('/', reviewController.getAllReviews);
router.get('/guard/:guardId', reviewController.getReviewsByGuard);

// Protected route
router.post('/:id', verifyToken, reviewController.createReview);

module.exports = router;
