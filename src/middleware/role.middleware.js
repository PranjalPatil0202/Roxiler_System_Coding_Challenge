/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles - List of allowed roles ('admin', 'normal_user', 'store_owner')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

module.exports = {
  authorize,
};
