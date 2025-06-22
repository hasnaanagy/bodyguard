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
  const { guard, user, discount } = req.body;
  try {
    let reservation = await Booking.create(req.body);
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
