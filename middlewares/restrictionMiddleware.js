const appError = require('../utils/appError');

// Usage: restriction(['admin', 'moderator'], { resource: 'cars', action: 'write' })
module.exports = (roles = [], permission = null) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      return next(new appError('You do not have permission to perform this action', 403));
    }

    // If moderator, check permissions
    if (user.role === 'moderator' && permission) {
      const { resource, action } = permission;
      const hasPermission =
        Array.isArray(user.permissions) &&
        user.permissions.some((p) => p.resource === resource && Array.isArray(p.actions) && p.actions.includes(action));
      if (!hasPermission) {
        return next(new appError('Moderator does not have the required permission', 403));
      }
    }
    // For other roles, just pass
    next();
  };
};
