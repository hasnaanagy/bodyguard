const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const protection = require('../middlewares/protectionMiddleware');
const { uploadMultiple } = require('../middlewares/upload');

// Auth routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/profile', protection, authController.getProfile);
// Profile update routes - protected
router.patch('/profile/update', protection, uploadMultiple, authController.updateProfile);
// Upload profileImage and criminalHistory (protected)
router.post('/profile/upload-files', protection, uploadMultiple, authController.uploadProfileFiles);

module.exports = router;
