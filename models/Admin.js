const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Client must have an email'],
    unique: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Client must have a phone number'],
  },
  password: {
    type: String,
    required: [true, 'Client must have a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  country: {
    type: String,
    required: [true, 'Client must have a country'],
  },
  age: {
    type: Number,
    required: [true, 'Client must have an age'],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'], // 'Point' for GeoJSON
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin',
  },
});

module.exports = mongoose.model('Admin', adminSchema);
