const { body } = require('express-validator');

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]~`+=]).{8,16}$/;

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters long'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters long')
    .matches(passwordRegex)
    .withMessage('Password must contain at least one uppercase letter and at least one special character'),

  body('address')
    .optional({ checkFalsy: false })
    .isString().withMessage('Address must be a string')
    .isLength({ max: 400 })
    .withMessage('Address cannot exceed 400 characters'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = {
  registerValidator,
  loginValidator,
  passwordRegex,
};
