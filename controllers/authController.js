const Client = require('../models/Clients');
const Guard = require('../models/Guards');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  try {
    const { role, password, email, phoneNumber, ...restData } = req.body;

    // Check email existence across all collections
    const emailExists = await Promise.all([
      Client.findOne({ email }),
      Guard.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    if (emailExists.some((user) => user !== null)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already registered',
      });
    }

    // Check phone number existence across all collections
    const phoneExists = await Promise.all([
      Client.findOne({ phoneNumber }),
      Guard.findOne({ phoneNumber }),
      Admin.findOne({ phoneNumber }),
    ]);

    if (phoneExists.some((user) => user !== null)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Phone number is already registered',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data with hashed password
    const userData = {
      ...restData,
      email,
      phoneNumber,
      password: hashedPassword,
    };

    let newUser;

    // Choose model based on role
    switch (role) {
      case 'client':
        newUser = await Client.create(userData);
        break;
      case 'guard':
        newUser = await Guard.create(userData);
        break;
      case 'admin':
        newUser = await Admin.create(userData);
        break;
      default:
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid role specified.',
        });
    }

    // Remove sensitive data from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: userResponse,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Check if emailOrPhone is email or phone number
    const isEmail = emailOrPhone.includes('@');
    const searchQuery = isEmail ? { email: emailOrPhone } : { phoneNumber: emailOrPhone };

    // Search in all collections
    const user = await Promise.all([
      Client.findOne(searchQuery),
      Guard.findOne(searchQuery),
      Admin.findOne(searchQuery),
    ]).then((results) => results.find((user) => user !== null));

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials',
      });
    }

    // Determine user role based on collection
    let role;
    if (user instanceof Client) role = 'client';
    else if (user instanceof Guard) role = 'guard';
    else if (user instanceof Admin) role = 'admin';

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      data: {
        user: userResponse,
        role,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const updates = req.body;

    // Fields that cannot be updated
    const restrictedFields = ['password', 'role', 'email', 'phoneNumber'];

    // Remove restricted fields from updates
    restrictedFields.forEach((field) => delete updates[field]);

    // Select the appropriate model based on user role
    let Model;
    switch (userRole) {
      case 'client':
        Model = Client;
        break;
      case 'guard':
        Model = Guard;
        // Additional validation for guard-specific fields
        if (updates.identificationNumber) {
          return res.status(400).json({
            status: 'fail',
            message: 'Cannot update identification number or certificates directly',
          });
        }
        break;
      case 'admin':
        Model = Admin;
        break;
      default:
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid user role',
        });
    }

    // Validate location if it's being updated
    if (updates.location) {
      if (
        !updates.location.type ||
        !updates.location.coordinates ||
        updates.location.type !== 'Point' ||
        !Array.isArray(updates.location.coordinates) ||
        updates.location.coordinates.length !== 2
      ) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid location format',
        });
      }
    }

    // Update the user profile
    const updatedUser = await Model.findByIdAndUpdate(
      userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        select: '-password',
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};
