const Booking = require('../models/bookingModel');
const ApiFeatures = require('../utils/apiFeatures');
exports.getAllBookings = async (req, res) => {
  // ? used for enable nested params form guard to get bookings
  let getOnly = {};
  if (req.params.guardId) getOnly.guard = req.params.guardId;
  const apiFeatures = new ApiFeatures(Booking.find(getOnly), req.query).filter().sort().limitFields().paginate();
  const reservations = await apiFeatures.query;
  /* const reservations = await Booking.find(getOnly); */
  res.status(200).json({
    status: 'success',
    results: reservations.length,
    data: reservations,
  });
};

exports.BookGuard = async (req, res) => {
  try {
    const clientId = req.user.id;
    const {
      guard,
      vehicle,
      startDate,
      endDate,
      startTime,
      endTime,
      discount = 0,
      originalPrice,
      finalPrice,
      status,
    } = req.body;
    const booking = await Booking.create({
      guard,
      user: clientId,
      vehicle,
      startDate,
      endDate,
      startTime,
      endTime,
      discount,
      originalPrice,
      finalPrice,
      status,
    });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const user = req.user;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ status: 'fail', message: 'Booking not found' });
    }

    if (!req.body) {
      return res.status(400).json({ status: 'fail', message: 'No data provided to update' });
    }
    if (user.role === 'admin') {
      Object.assign(booking, req.body);
    } else if (user.role === 'client' && booking.user.toString() === user.id) {
      const allowedFields = ['startDate', 'endDate', 'vehicle'];
      Object.keys(req.body).forEach((key) => {
        if (allowedFields.includes(key)) {
          booking[key] = req.body[key];
        }
      });
    } else {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to update this booking' });
    }
    await booking.save();
    res.status(200).json({
      status: 'success',
      data: { booking },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message || err,
    });
  }
};
