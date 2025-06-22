const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Guard = require('../models/Guards');
const Client = require('../models/Clients');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { guard, car, startDate, endDate, startTime, endTime, discount = 0 } = req.body;

    // Find guard
    const guardDoc = await Guard.findById(guard);
    if (!guardDoc) {
      return res.status(400).json({ status: 'fail', message: 'Invalid guard' });
    }
    let guardPrice = guardDoc.price || 0;

    // Find car if provided
    let carDoc = null;
    let carPrice = 0;
    if (car) {
      carDoc = await Car.findById(car);
      if (!carDoc) {
        return res.status(400).json({ status: 'fail', message: 'Invalid car' });
      }
      carPrice = carDoc.price;
    }

    // Calculate original and final price
    const originalPrice = guardPrice + carPrice;
    const finalPrice = originalPrice - originalPrice * (discount / 100);

    const booking = await Booking.create({
      startDate,
      endDate,
      startTime,
      endTime,
      guard,
      client: clientId,
      car: car || undefined,
      originalPrice,
      discount,
      finalPrice,
      status: 'pending',
    });

    res.status(201).json({
      status: 'success',
      data: { booking },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
