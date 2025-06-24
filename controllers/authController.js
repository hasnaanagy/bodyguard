const { User, Guard, Admin, Client, Moderator } = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User (with discriminator)
exports.registerUser = async (req, res) => {
  try {
    const { role, password, email, phoneNumber, name, country, age, location } = req.body;

    // Check if email or phone already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already registered',
      });
    }
    const phoneExists = await User.findOne({ phoneNumber });
    if (phoneExists) {
      return res.status(400).json({
        status: 'fail',
        message: 'Phone number is already registered',
      });
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
      case 'admin':
        newUser = await Admin.create({ ...userData });
        break;
      case 'moderator':
        newUser = await Moderator.create({ ...userData });
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

// Login User (with discriminator)
exports.loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    // Check if emailOrPhone is email or phone number
    const isEmail = emailOrPhone.includes('@');
    const searchQuery = isEmail ? { email: emailOrPhone } : { phoneNumber: emailOrPhone };

    // Find user in User collection
    const user = await User.findOne(searchQuery);

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
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getProfile = async (req, res) => {
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
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid role specified.',
        });
    }

    const user = await Model.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.uploadProfileFiles = async (req, res) => {
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
        return res.status(400).json({ status: 'fail', message: 'Invalid user role' });
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
          return res.status(400).json({
            status: 'fail',
            message: 'You must have an existing criminalHistory before uploading a new one.',
          });
        }
        updateData.criminalHistory = req.files.pdf[0].googleDriveUrl;
      } else {
        return res.status(400).json({
          status: 'fail',
          message: 'Only guards can upload criminal history PDF.',
        });
      }
    }

    // if (!req.body || Object.keys(req.body).length === 0) {
    //   return res.status(400).json({ status: 'fail', message: 'No data provided to update' });
    // }

    const updatedUser = await Model.findByIdAndUpdate(userId, { $set: updateData }, { new: true, select: '-password' });

    if (!updatedUser) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Files uploaded and profile updated',
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
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
    else return res.status(400).json({ status: 'fail', message: 'Invalid role' });

    // رفع الصور والملفات
    if (req.files?.profilePic?.[0]?.googleDriveUrl) {
      updates.profileImage = req.files.profilePic[0].googleDriveUrl;
    }

    if (req.files?.pdf?.[0]?.googleDriveUrl) {
      if (userRole === 'guard') {
        updates.criminalHistory = req.files.pdf[0].googleDriveUrl;
      } else {
        return res.status(400).json({
          status: 'fail',
          message: 'Only guards can upload criminal history PDF.',
        });
      }
    }

    // تحقق من صيغة الموقع الجغرافي (لو موجود)
    if (updates.location) {
      const loc = updates.location;
      if (!loc.type || loc.type !== 'Point' || !Array.isArray(loc.coordinates) || loc.coordinates.length !== 2) {
        return res.status(400).json({ status: 'fail', message: 'Invalid location format' });
      }
    }

    // ممنوع تعديل بيانات حساسة للحراس
    if (userRole === 'guard' && (updates.identificationNumber || updates.Certificates)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot update identification number or certificates directly',
      });
    }

    // تحقق من وجود بيانات للتحديث
    const hasFile = req.files?.profilePic || req.files?.pdf;
    if (!Object.keys(updates).length && !hasFile) {
      return res.status(400).json({
        status: 'fail',
        message: 'No data provided to update',
      });
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
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};
