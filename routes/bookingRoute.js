const express = require('express');
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

router.use(verifyToken);

router.post('/:guardId', bookingController.createBooking);
router.get('/', bookingController.getBookings);
router.patch('/:bookingId/confirm', bookingController.confirmBooking);
router.patch('/:bookingId/reject', bookingController.rejectBooking);

module.exports = router;
