const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: [true, 'Car price is required'],
  },
  model: {
    type: Number,
    required: [true, 'Car model is required'],
  },
  type: {
    type: String,
    required: [true, 'Car type is required'],
  },
  color: {
    type: String,
    required: [true, 'Car color is required'],
  },
  lisenceImage: {
    type: String,
    required: [true, 'Car must have a lisenceImage'],
  },
  expiDate: {
    type: Date,
    required: [true, 'Car must have an expiration date'],
  },
});

const Car = mongoose.model('Car', carSchema);
module.exports = Car;
