const { User } = require('../models');

/**
 * PATCH /api/users/update-password
 * Authenticated user updates their own password
 */
const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const isMatch = await user.isValidPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    // Set new password (model hook will re-hash it automatically)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/me
 * Get current authenticated user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updatePassword,
  getProfile,
};
