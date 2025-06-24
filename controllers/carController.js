const Car = require('../models/Car');
const Booking = require('../models/bookingModel');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllCars = async (req, res) => {
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
      console.log('booked cars', bookedCars);

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
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { car },
    });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.createCar = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Only admin can create a car' });
    }
    const newCar = await Car.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { car: newCar },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

exports.updateCar = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Only admin can update a car' });
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
    res.status(404).json({ status: 'fail', message: err });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'fail', message: 'Only admin can delete a car' });
    }
    await Car.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err });
  }
};
