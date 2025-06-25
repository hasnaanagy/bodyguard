const express = require('express');
const reviewController = require('../controllers/reviewController');
const protection = require('../middlewares/protectionMiddleware');
const restriction = require('../middlewares/restrictionMiddleware');
const router = express.Router();

// Public routes
router.get('/', protection, restriction('admin', 'moderator'), reviewController.getAllReviews);
router.get('/guard/:guardId', reviewController.getReviewsByGuard);

// Protected route
router.post('/:id', protection, reviewController.createReview);

module.exports = router;
