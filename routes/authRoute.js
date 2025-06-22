const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');

// Auth routes
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

// Profile update routes - protected
router.patch('/profile/update', verifyToken, authController.updateProfile);

module.exports = router;
