const Guard = require('../models/Guards');
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
