const { Guard } = require('../models/User');
const Booking = require('../models/bookingModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllGuards = async (req, res) => {
  try {
    let guards;
    const { startDate, endDate } = req.query;

    if (startDate && endDate) {
      const bookedGuards = await Booking.find({
        $and: [
          {
            startDate: { $gte: startDate },
            endDate: { $lte: endDate },
          },
        ],
        status: 'approved',
      }).distinct('guard');
      const execludedFields = ['startDate', 'endDate'];
      const newQuery = { ...req.query };
      execludedFields.forEach((el) => delete newQuery[el]);
      const apiFeatures = new APIFeatures(Guard.find({ _id: { $nin: bookedGuards }, status: 'approved' }), newQuery)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      guards = await apiFeatures.query;
    } else {
      const apiFeatures = new APIFeatures(Guard.find(), req.query).filter().sort().limitFields().paginate();
      guards = await apiFeatures.query;
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
      message: err.message || err,
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
