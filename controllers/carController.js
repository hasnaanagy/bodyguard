const Car = require('../models/Car');
const Booking = require('../models/Booking');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
exports.getAllCars = async (req, res, next) => {
  try {
    let cars;
    const { startDate, endDate } = req.query;
    if (startDate && endDate) {
      const bookedCars = await Booking.find({
        $and: [
          {
            startDate: { $gte: startDate },
            endDate: { $lte: endDate },
          },
        ],
        status: 'approved',
      }).distinct('vehicle');

      //remove start and end date from req.query before filter because it is not in the car schema
      const execludedFields = ['startDate', 'endDate'];
      const newQuery = { ...req.query };
      execludedFields.forEach((el) => delete newQuery[el]);

      const features = new APIFeatures(Car.find({ _id: { $nin: bookedCars } }), newQuery)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      cars = await features.query;
    } else {
      const apiFeatures = new APIFeatures(Car.find(), req.query).filter().sort().limitFields().paginate();
      cars = await apiFeatures.query;
    }
    res.status(200).json({
      status: 'success',
      results: cars.length,
      data: { cars },
    });
  } catch (err) {
    next(err);
  }
};

exports.getCar = async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { car },
    });
  } catch (err) {
    next(err);
  }
};

exports.createCar = async (req, res, next) => {
  try {
    const newCar = await Car.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { car: newCar },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCar = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new AppError(' Only admin can update a car', 403);
    }
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: { car },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      throw new AppError(' Only admin can delete a car', 403);
    }
    await Car.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};
