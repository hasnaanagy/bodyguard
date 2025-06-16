const mongoose = require('mongoose');

const guardSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  image: {
    type: String,
    required: [true, 'Guard image is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  languages: {
    type: [String],
    required: [true, 'Languages are required'],
  },
  identity: {
    type: String,
    required: [true, 'Identity is required'],
  },
  qualifications: {
    type: [String],
    required: [true, 'Qualifications are required'],
  },
  status: {
    type: String,
    enum: {
      values: ['accepted', 'rejected', 'pending'],
      message: 'Status must be either accepted, rejected, or pending',
    },
    default: 'pending',
    required: [true, 'Status is required'],
  },
  rejectionReason: {
    type: String,
    required: [
      function () {
        return this.status === 'rejected';
      },
      'Rejection reason is required if status is rejected',
    ],
    default: '',
  },
});

const Guard = mongoose.model('Guard', guardSchema);
module.exports = Guard;
