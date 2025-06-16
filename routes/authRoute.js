const express = require('express');
const authController = require('../controllers/authController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();
// Register route
router.post('/register', authController.register);
// Login route
router.post('/login', authController.login);
// Protected route
module.exports = router;
