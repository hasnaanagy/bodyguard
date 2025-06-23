const mongoose = require('mongoose');
const Guard = require('../models/Guards');
const Booking = require('../models/bookingModel');

exports.getAvailableGuards = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ message: 'Start date and end date are required' });

    const bookedGuards = await Booking.find({
      $or: [{ startDate: { $gte: startDate } }, { endTime: { $lte: endDate } }],
      status: 'approved',
    }).distinct('guard');

    console.log(bookedGuards);

    const availableGuards = await Guard.find({
      _id: { $nin: bookedGuards },
      status: 'approved',
    });

    res.status(200).json({
      status: 'success',
      data: {
        availableGuards,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
