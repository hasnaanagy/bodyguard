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

exports.getAllPendingGuards = async (req, res) => {
  const pendingGuards = await Guard.find({ status: 'pending' });
  res.status(200).json({
    status: 'success',
    data: {
      pendingGuards,
    },
  });
};

exports.UpdateGuardStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const guard = await Guard.findOneAndUpdate({ _id: id }, { status: status }, { new: true });
  res.status(200).json({
    status: 'success',
    data: {
      guard,
    },
  });
};

exports.getGuard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guard = await Guard.findById(id);
    if (!guard) {
      throw new AppError('No guard found with that ID', 404);
    }
    res.status(200).json({
      status: 'success',
      data: {
        guard,
      },
    });
  } catch (err) {
    next(err);
  }
};
