const Guard = require('../models/guardModel');
const User = require('../models/User');

exports.createGuard = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'client') {
      return res.status(400).json({ message: 'Only clients can apply to be a guard' });
    }
    // Create guard profile
    const guardData = {
      _id: userId,
      ...req.body,
      status: 'pending',
      user: userId,
    };
    const guard = await Guard.create(guardData);
    res.status(201).json({
      message: 'Guard application submitted successfully',
      guard,
    });
  } catch (error) {
    console.error('Error applying as guard:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all pending guard applications (admin only)
exports.getPendingGuards = async (req, res) => {
  try {
    // Only admin can access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    const pendingGuards = await Guard.find({ status: 'pending' }).populate('user', 'name email phone');
    res.status(200).json({
      message: 'Pending guard applications',
      guards: pendingGuards,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept or reject a guard application (admin only)
exports.verifyGuard = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    const { id } = req.params;
    const { action, rejectionReason } = req.body;
    const guard = await Guard.findById(id);
    if (!guard) {
      return res.status(404).json({ message: 'Guard application not found' });
    }
    if (action === 'accept') {
      guard.status = 'accepted';
      guard.rejectionReason = '';
      await guard.save();
      // Update user role to guard
      await User.findByIdAndUpdate(guard.user, { role: 'guard' });
      return res.status(200).json({ message: 'Guard application accepted', guard });
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }
      guard.status = 'rejected';
      guard.rejectionReason = rejectionReason;
      await guard.save();
      return res.status(200).json({ message: 'Guard application rejected', guard });
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject".' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateGuard = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const guard = await Guard.findById(id);
    if (!guard) {
      return res.status(404).json({ message: 'Guard application not found' });
    }
    // Only the owner can update
    if (guard.user.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this application' });
    }
    // Track if identity or qualifications are being updated
    let resetPending = false;
    if (
      (req.body.identity && req.body.identity !== guard.identity) ||
      (req.body.qualifications && JSON.stringify(req.body.qualifications) !== JSON.stringify(guard.qualifications))
    ) {
      resetPending = true;
    }
    // Update fields
    Object.keys(req.body).forEach((key) => {
      guard[key] = req.body[key];
    });
    // If identity or qualifications changed, reset status to pending and clear rejectionReason
    if (resetPending) {
      guard.status = 'pending';
      guard.rejectionReason = '';
    }
    await guard.save();
    res.status(200).json({ message: 'Guard application updated', guard });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
