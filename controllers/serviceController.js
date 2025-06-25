const Service = require('../models/servicesModel');
const AppError = require('../utils/appError');

module.exports.getAllServices = async (req, res) => {};

module.exports.createService = async (req, res, next) => {
  const { title, description, price } = req.body;
  if (!title || !price) {
    return next(new AppError('service title and price  are required', 400));
  }
  const service = await Service.create({ title, description, price });

  res.status(201).json({
    status: 'success',
    service,
  });
};

module.exports.updateService = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, price } = req.body;
  const service = await Service.findByIdAndUpdate(id, { title, description, price }, { new: true });
  if (!service) {
    return next(new AppError('service not found', 404));
  }
  res.status(200).json({
    status: 'success',
    service,
  });
};

module.exports.deleteService = async (req, res, next) => {
  const { id } = req.params;
  const service = await Service.findByIdAndDelete(id);
  if (!service) {
    return next(new AppError('service not found', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
