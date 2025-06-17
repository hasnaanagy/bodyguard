const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true,
  },
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
});

const Car = mongoose.model('Car', carSchema);
module.exports = Car;
