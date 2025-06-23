const Router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router({ mergeParams: true });

Router.route('/').get(bookingController.getAllBookings).post(verifyToken, bookingController.BookGuard);
Router.route('/:id').patch(verifyToken, bookingController.updateBooking);

module.exports = Router;
