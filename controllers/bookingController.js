const Booking = require('../models/Booking');
const Guard = require('../models/guardModel');
const User = require('../models/User');
const AppError = require('../utils/appError');

exports.createBooking = async (req, res) => {
  try {
    const { guardId } = req.params;
    const { startDate, endDate, location, notes } = req.body;
    const clientId = req.user.id;
    const userRole = req.user.role;

    // Check if user is a client
    if (userRole !== 'client') {
      return res.status(403).json({
        status: 'error',
        message: 'Only clients can make bookings',
      });
    }

    // Find guard and check if exists
    const guard = await Guard.findById(guardId);
    if (!guard) {
      return res.status(404).json({
        status: 'error',
        message: 'Guard not found',
      });
    }

    // Find user associated with guard and check role
    const guardUser = await User.findById(guardId);
    if (!guardUser || guardUser.role !== 'guard') {
      return res.status(403).json({
        status: 'error',
        message: 'Can only book users with guard role',
      });
    }

    // Check if guard is available
    const isAvailable = await Booking.checkAvailability(guardId, new Date(startDate), new Date(endDate));

    if (!isAvailable) {
      return res.status(400).json({
        status: 'error',
        message: 'Guard is not available for these dates',
      });
    }

    // Validate dates
    if (new Date(startDate) < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date cannot be in the past',
      });
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        status: 'error',
        message: 'End date must be after start date',
      });
    }

    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = days * guard.price;

    const booking = await Booking.create({
      guard: guardId,
      client: clientId,
      startDate,
      endDate,
      location,
      notes,
      totalPrice,
      status: 'pending',
    });

    console.log(`📩 New booking request created by client ID: ${clientId} for guard ID: ${guardId}`);

    res.status(201).json({
      status: 'success',
      data: { booking },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const { role, id } = req.user;
    let bookings;

    if (role === 'admin') {
      bookings = await Booking.find().populate('guard').populate('client', 'name email phone');
    } else if (role === 'guard') {
      bookings = await Booking.find({ guard: id }).populate('client', 'name email phone');
    } else {
      bookings = await Booking.find({ client: id }).populate('guard');
    }

    res.status(200).json({ status: 'success', results: bookings.length, data: { bookings } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if logged in user is the guard assigned to this booking
    if (booking.guard.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to confirm this booking' });
    }

    booking.status = 'confirmed';
    await booking.save();

    console.log(`✅ Booking confirmed by guard ID: ${booking.guard}`);
    res.status(200).json({ status: 'success', message: 'Booking confirmed' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if logged in user is the guard assigned to this booking
    if (!booking.guard || booking.guard.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to confirm this booking' });
    }
    booking.status = 'rejected';
    booking.reasonOfRejection = reason;
    await booking.save();

    console.log(`❌ Booking rejected by guard. Reason: ${reason}`);
    res.status(200).json({ status: 'success', message: 'Booking rejected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
