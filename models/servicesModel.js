const mongoose = require('mongoose');
const servciesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service name is required'],
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
  },
});

const Services = mongoose.model('Services', servciesSchema);
module.exports = Services;
