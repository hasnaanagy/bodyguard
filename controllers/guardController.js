const { Guard } = require('../models/User');
const Booking = require('../models/Booking');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

exports.getAllGuards = async (req, res, next) => {
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

      //remove start and end date from req.query before filter because it is not in the car schema
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
    next(err);
  }
};

exports.UpdateGuardStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, reason } = req.body;
  if (status === 'rejected') {
    if (!reason) {
      return next(new AppError('Please provide a reason for rejection', 400));
    }
    const guard = await Guard.findOneAndUpdate({ _id: id }, { status, reason }, { new: true });
    res.status(200).json({
      status: 'success',
      data: {
        guard,
      },
    });
  } else {
    const guard = await Guard.findOneAndUpdate({ _id: id }, { status }, { new: true });
    res.status(200).json({
      status: 'success',
      data: {
        guard,
      },
    });
  }
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
