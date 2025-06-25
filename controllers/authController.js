const { User, Guard, Admin, Client, Moderator } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

// Register User (with discriminator)
exports.registerUser = async (req, res, next) => {
  try {
    const { role, password, email, phoneNumber, name, country, age, location } = req.body;
    // Check if email or phone already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new AppError('Email is already registered', 400);
    }
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      throw new AppError('Phone number is already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data
    let userData = {
      name,
      phoneNumber,
      password: hashedPassword,
      country,
      email,
      age,
      location,
      role,
    };

    let newUser;
    switch (role) {
      case 'client':
        newUser = await Client.create(userData);
        break;
      case 'guard':
        newUser = await Guard.create({
          ...userData,
          identificationNumber: req.body.identificationNumber,
          qualification: req.body.qualification,
          hobbies: req.body.hobbies,
          languages: req.body.languages,
          experienceYears: req.body.experienceYears,
          Certificates: req.body.Certificates,
          price: req.body.price,
          services: req.body.services,
          criminalHistory: req.body.criminalHistory,
        });
        break;
      default:
        throw new AppError('Invalid role specified', 401);
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
    next(err);
  }
};

// Login User (with discriminator)
exports.loginUser = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Check if emailOrPhone is email or phone number
    const isEmail = emailOrPhone.includes('@');
    const searchQuery = isEmail ? { email: emailOrPhone } : { phoneNumber: emailOrPhone };

    // Find user in User collection
    const user = await User.findOne(searchQuery);

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      data: {
        user: userResponse,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Select the appropriate model based on user role
    let Model;
    switch (userRole) {
      case 'client':
        Model = Client;
        break;
      case 'guard':
        Model = Guard;
        break;
      case 'admin':
        Model = Admin;
        break;
      case 'moderator':
        Model = Moderator;
        break;
      default:
        throw new AppError('Invalid role specified', 401);
    }

    const user = await Model.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadProfileFiles = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let Model;
    switch (userRole) {
      case 'client':
        Model = Client;
        break;
      case 'guard':
        Model = Guard;
        break;
      case 'admin':
        Model = Admin;
        break;
      case 'moderator':
        Model = Moderator;
        break;
      default:
        throw new AppError('Invalid user role', 400);
    }

    // Prepare update object
    const updateData = {};
    if (req.files && req.files.profilePic && req.files.profilePic[0].googleDriveUrl) {
      updateData.profileImage = req.files.profilePic[0].googleDriveUrl;
    }
    if (req.files && req.files.pdf && req.files.pdf[0].googleDriveUrl) {
      if (userRole === 'guard') {
        // For guards, optionally check if criminalHistory already exists
        const user = await Guard.findById(userId);
        if (!user.criminalHistory) {
          throw new AppError('Invalid role You must have an existing criminalHistory before uploading a new one.', 400);
        }
        updateData.criminalHistory = req.files.pdf[0].googleDriveUrl;
      } else {
        throw new AppError('Only guards can upload criminal history PDF.', 400);
      }
    }

    const updatedUser = await Model.findByIdAndUpdate(userId, { $set: updateData }, { new: true, select: '-password' });

    if (!updatedUser) {
      throw new AppError('User not found.', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Files uploaded and profile updated',
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const updates = req.body;

    // // امنع تعديل بيانات حساسة
    // const restrictedFields = ['password', 'role', 'email', 'phoneNumber'];
    // restrictedFields.forEach((field) => delete updates[field]);

    // تحديد الموديل حسب الدور
    let Model;
    if (userRole === 'guard') Model = Guard;
    else if (userRole === 'admin') Model = Admin;
    else if (userRole === 'client') Model = Client;
    else if (userRole === 'moderator') Model = Moderator;
    else {
      throw new AppError('Invalid role specified', 401);
    }

    // رفع الصور والملفات
    if (req.files?.profilePic?.[0]?.googleDriveUrl) {
      updates.profileImage = req.files.profilePic[0].googleDriveUrl;
    }

    if (req.files?.pdf?.[0]?.googleDriveUrl) {
      if (userRole === 'guard') {
        updates.criminalHistory = req.files.pdf[0].googleDriveUrl;
      } else {
        throw new AppError('Only guards can upload criminal history PDF.', 400);
      }
    }

    // تحقق من صيغة الموقع الجغرافي (لو موجود)
    if (updates.location) {
      const loc = updates.location;
      if (!loc.type || loc.type !== 'Point' || !Array.isArray(loc.coordinates) || loc.coordinates.length !== 2) {
        throw new AppError('Invalid location format.', 400);
      }
    }

    // ممنوع تعديل بيانات حساسة للحراس
    if (userRole === 'guard' && (updates.identificationNumber || updates.Certificates)) {
      throw new AppError('Cannot update identification number or certificates directly', 400);
    }

    // تحقق من وجود بيانات للتحديث
    const hasFile = req.files?.profilePic || req.files?.pdf;
    if (!Object.keys(updates).length && !hasFile) {
      throw new AppError('No data provided to update', 400);
    }

    // تحديث المستخدم
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
      throw new AppError('User not found.', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
};
