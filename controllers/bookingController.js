const Booking = require('../models/bookingModel');

exports.getAllBookings = async (req, res) => {
  try {
    const allBookings = await Booking.find().populate('guard user');
    res.status(200).json(allBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
