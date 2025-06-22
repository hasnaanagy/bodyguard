const Router = require('express').Router();
const { getAllBookings, BookGuard } = require('../controllers/bookingController');

Router.route('/').get(getAllBookings).post(BookGuard);

module.exports = Router;
