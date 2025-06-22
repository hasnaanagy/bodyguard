const mongoose = require('mongoose');

const guardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Guard must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Guard must have an email'],
    unique: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Guard must have a phone number'],
  },
  password: {
    type: String,
    required: [true, 'Guard must have a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  country: {
    type: String,
    required: [true, 'Guard must have a country'],
  },
  age: {
    type: Number,
    required: [true, 'Guard must have an age'],
  },
  identificationNumber: {
    type: String,
    sparse: true, // مهم جداً
  },
  qualification: {
    type: String,
  },
  hobbies: {
    type: [String],
    default: [],
  },
  languages: {
    type: [String],
    default: [],
  },
  location: {
    type: {
      type: String,
      enum: ['Point'], // 'Point' for GeoJSON
      /* required: true, */
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  experienceYears: {
    type: Number,
  },
  Certificates: {
    type: [String],
    default: [],
  },
  price: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true,
  },
  services: {
    type: String,
    enum: ['Escort', 'event insurance', 'VIP insurance'],
    default: 'Escort',
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Guard', guardSchema);
