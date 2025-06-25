const { User, Moderator } = require('../models/User');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');

const VALID_RESOURCES = ['bookings', 'reviews', 'cars', 'services'];
const VALID_ACTIONS = ['read', 'write', 'edit', 'delete'];

exports.createAdminsAndModerators = async (req, res, next) => {
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
      case 'admin':
        newUser = await Admin.create({ ...userData });
        break;
      case 'moderator':
        newUser = await Moderator.create({ ...userData });
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

//checks if every permission is an array && every resource is valid && every actions is array && and every action is valid
const validatePermissions = (permissions) => {
  return (
    Array.isArray(permissions) &&
    permissions.every(
      (p) =>
        VALID_RESOURCES.includes(p.resource) &&
        Array.isArray(p.actions) &&
        p.actions.every((a) => VALID_ACTIONS.includes(a))
    )
  );
};

//used only if it is old moderator and i want to give him new resource or new action
const mergePermissions = (existing, incoming) => {
  const result = [...existing];

  for (const newPerm of incoming) {
    const existingPerm = result.find((p) => p.resource === newPerm.resource);
    if (existingPerm) {
      for (const action of newPerm.actions) {
        if (!existingPerm.actions.includes(action)) {
          existingPerm.actions.push(action);
        }
      }
    } else {
      result.push({ resource: newPerm.resource, actions: [...newPerm.actions] });
    }
  }

  return result;
};

exports.assignPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    // validate permissions
    if (!validatePermissions(permissions)) {
      throw new AppError('Invalid permissions format', 400);
    }
    // check if user exists
    let user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    // update permissions for moderator
    if (user.role === 'moderator') {
      const moderator = await Moderator.findById(id);
      moderator.permissions = mergePermissions(moderator.permissions, permissions);
      await moderator.save();
      return res.status(200).json({ message: 'Permissions updated', user: moderator });
    }
    throw new AppError('only moderators are supported', 400);
  } catch (err) {
    next(err);
  }
};
