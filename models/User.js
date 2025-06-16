const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['client', 'guard', 'admin'],
    default: 'client',
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number!'],
  },
  country: {
    type: String,
    required: [true, 'Please provide your country!'],
  },
  age: {
    type: Number,
    required: [true, 'Please provide your age!'],
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
