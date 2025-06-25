const express = require('express');
const Router = require('express').Router({ mergeParams: true });
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
Router.route('/:id')
  .get(protection, bookingController.getBookingById)
  .patch(
    protection,
    restriction(['admin', 'moderator', 'client'], { resource: 'bookings', action: 'edit' }),
    bookingController.updateBooking
  )
  .delete(
    protection,
    restriction(['admin', 'moderator'], { resource: 'bookings', action: 'delete' }),
    bookingController.deleteBooking
  );

Router.route('/users/:id').get(protection, bookingController.getBookingByUserId);
module.exports = Router;
