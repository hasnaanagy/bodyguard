const Router = require('express').Router();
const express = require('express');
const { getAllBookings, BookGuard } = require('../controllers/bookingController');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router({ mergeParams: true });

Router.route('/').get(getAllBookings).post(verifyToken, BookGuard);

module.exports = Router;
