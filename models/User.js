const mongoose = require('mongoose');

const options = {
  discriminatorKey: 'role',
  timestamps: true,
};

// Base User schema (common fields)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'User must have an email'],
      unique: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'User must have a phone number'],
    },
    password: {
      type: String,
      required: [true, 'User must have a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    country: {
      type: String,
      required: [true, 'User must have a country'],
    },
    age: {
      type: Number,
      required: [true, 'User must have an age'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
    profileImage: {
      type: String,
    },
    passwordChangedAt: Date,
  },
  options
);

const User = mongoose.model('User', userSchema);

// Guard-specific fields
const guardSchema = new mongoose.Schema(
  {
    identificationNumber: {
      type: String,
      required: [true, 'Guard must have an identification number'],
      unique: true,
      sparse: true,
    },
    qualification: String,
    hobbies: [String],
    languages: [String],
    experienceYears: Number,
    Certificates: [String],
    price: Number,
    status: {
      type: String,
      enum: ['pending', 'aproved', 'rejected'],
      default: 'pending',
      required: true,
    },
    services: {
      type: String,
      enum: ['Escort', 'event insurance', 'VIP insurance'],
      default: 'Escort',
    },
    criminalHistory: String,
    reasons: [
      {
        reason: {
          type: String,
          required: true,
        },
        desciption: {
          type: String,
          required: true,
        },
        addAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { ...options, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Admin-specific fields (example: role)
const adminSchema = new mongoose.Schema(
  {
    permissions: [
      {
        resource: { type: String }, // مثلاً: 'bookings', 'guards'
        actions: [{ type: String }], // مثلاً: ['read', 'create', 'update', 'delete']
      },
    ],

    lastLogin: Date,
    // role: {
    //   type: String,
    //   enum: ['admin', 'superadmin'],
    //   default: 'admin',
    // },
  },
  options
);

// Client-specific fields (add more if needed)
const clientSchema = new mongoose.Schema({}, options);

// ! Instance method to check if password was changed after JWT was issued
userSchema.methods.checkPasswordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTTimestamp < changedTimestamp; // if true, password was changed after token was issued
  }
  //  false means not changed
  return false;
};
// Create discriminators
const Guard = User.discriminator('guard', guardSchema);
const Admin = User.discriminator('admin', adminSchema);
const Client = User.discriminator('client', clientSchema);

module.exports = { User, Guard, Admin, Client };
