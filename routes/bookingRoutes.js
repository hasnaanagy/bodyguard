const Router = require('express').Router();
const { getAllBookings } = require('../controllers/bookingController');

Router.route('/').get(getAllBookings);

module.exports = Router;
