const Booking = require('../models/bookingModel');

exports.getAllBookings = async (req, res) => {
  try {
    const allBookings = await Booking.find();
    res.status(200).json(allBookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
