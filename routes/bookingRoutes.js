const Router = require('express').Router();
const express = require('express');
const bookingController = require('../controllers/bookingController');
const protection = require('../middlewares/protectionMiddleware');
const restriction = require('../middlewares/restrictionMiddleware');
const router = express.Router({ mergeParams: true });

Router.route('/')
  .get(protection, bookingController.getAllBookings)
  .post(
    protection,
    restriction(['admin', 'moderator', 'client'], { resource: 'bookings', action: 'write' }),
    bookingController.BookGuard
  );
Router.route('/:id').patch(
  protection,
  restriction(['admin', 'moderator', 'client'], { resource: 'bookings', action: 'edit' }),
  bookingController.updateBooking
);

module.exports = Router;
