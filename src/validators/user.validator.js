const { body } = require('express-validator');
const { passwordRegex } = require('./auth.validator');

const updatePasswordValidator = [
  body('oldPassword')
    .notEmpty().withMessage('Current password (oldPassword) is required'),

  body('newPassword')
    .notEmpty().withMessage('New password (newPassword) is required')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters long')
    .matches(passwordRegex)
    .withMessage('New password must contain at least one uppercase letter and at least one special character'),
];

module.exports = {
  updatePasswordValidator,
};
