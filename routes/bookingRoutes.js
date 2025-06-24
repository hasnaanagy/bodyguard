const express = require('express');
const Router = require('express').Router({ mergeParams: true });
const bookingController = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');

Router.route('/').get(bookingController.getAllBookings).post(verifyToken, bookingController.BookGuard);
Router.route('/:id').patch(verifyToken, bookingController.updateBooking);

module.exports = Router;
