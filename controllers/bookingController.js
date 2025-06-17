const Booking = require('../models/bookingModel');
const Car = require('../models/carModel');
const mongoose = require('mongoose');
const User = mongoose.model('../models/User');

exports.createBooking = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { guard, car, startDate, endDate, startTime, endTime, discount = 0 } = req.body;

    // Find guard (user with role 'guard')
    const guardUser = await User.findById(guard);
    if (!guardUser || guardUser.role !== 'guard') {
      return res.status(400).json({ status: 'fail', message: 'Invalid guard' });
    }

    let originalPrice = guardUser.price || 0;
    let carDoc = null;
    if (car) {
      carDoc = await Car.findById(car);
      if (!carDoc) {
        return res.status(400).json({ status: 'fail', message: 'Invalid car' });
      }
      originalPrice += carDoc.price;
    }

    // Calculate price after discount
    const priceAfterDiscount = originalPrice - discount;

    const booking = await Booking.create({
      startDate,
      endDate,
      startTime,
      endTime,
      guard,
      client: clientId,
      car: car || undefined,
      originalPrice,
      discount,
      priceAfterDiscount,
      status: 'pending',
    });

    res.status(201).json({
      status: 'success',
      data: { booking },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
