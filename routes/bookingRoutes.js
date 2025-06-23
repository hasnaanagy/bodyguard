const Router = require('express').Router();
const { getAllBookings, BookGuard } = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');

Router.route('/').get(getAllBookings).post(verifyToken, BookGuard);

module.exports = Router;
