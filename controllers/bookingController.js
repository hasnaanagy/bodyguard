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
      car,
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
      car,
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
