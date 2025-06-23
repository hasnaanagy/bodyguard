const mongoose = require('mongoose');
const Guard = require('../models/Guards');
const Booking = require('../models/bookingModel');
const { listenerCount } = require('../models/Clients');

exports.getGuards = async (req, res) => {
  try {
    let guards;
    const { startDate, endDate } = req.query;

    if (startDate && endDate) {
      const bookedGuards = await Booking.find({
        $or: [{ startDate: { $gte: startDate } }, { endTime: { $lte: endDate } }],
        status: 'approved',
      }).distinct('guard');

      guards = await Guard.find({
        _id: { $nin: bookedGuards },
        status: 'approved',
      });
    } else {
      guards = await Guard.find({});
    }
    res.status(200).json({
      status: 'success',
      data: {
        guards,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};
