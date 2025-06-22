const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');
const { uploadMultiple } = require('../middlewares/upload');

// Auth routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Profile update routes - protected
router.patch('/profile/update', verifyToken, authController.updateProfile);

// Upload profileImage and criminalHistory (protected)
router.post('/profile/upload-files', verifyToken, uploadMultiple, authController.uploadProfileFiles);

module.exports = router;
