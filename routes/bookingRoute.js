const express = require('express');
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.route('/').post(verifyToken, bookingController.createBooking);

module.exports = router;
