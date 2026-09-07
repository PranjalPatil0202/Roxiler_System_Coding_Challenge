const { body, query, param } = require('express-validator');
const { passwordRegex } = require('./auth.validator');

const createUserValidator = [
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

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['admin', 'normal_user', 'store_owner'])
    .withMessage('Role must be admin, normal_user, or store_owner'),
];

const createStoreValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required')
    .isLength({ min: 20, max: 60 })
    .withMessage('Store name must be between 20 and 60 characters long'),

  body('email')
    .trim()
    .notEmpty().withMessage('Store email is required')
    .isEmail().withMessage('Please provide a valid store email address')
    .normalizeEmail(),

  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required')
    .isLength({ max: 400 })
    .withMessage('Store address cannot exceed 400 characters'),

  body('owner_id')
    .optional({ nullable: true, checkFalsy: false })
    .isInt({ min: 1 })
    .withMessage('owner_id must be a valid positive integer user ID'),
];

const listUsersValidator = [
  query('search').optional().isString().trim(),
  query('name').optional().isString().trim(),
  query('email').optional().isString().trim(),
  query('address').optional().isString().trim(),
  query('role')
    .optional()
    .isIn(['admin', 'normal_user', 'store_owner'])
    .withMessage('Role filter must be admin, normal_user, or store_owner'),
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'address', 'role', 'created_at', 'id'])
    .withMessage('sortBy must be name, email, address, role, created_at, or id'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('sortOrder must be ASC or DESC'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const listStoresValidator = [
  query('search').optional().isString().trim(),
  query('name').optional().isString().trim(),
  query('email').optional().isString().trim(),
  query('address').optional().isString().trim(),
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'address', 'created_at', 'id', 'rating'])
    .withMessage('sortBy must be name, email, address, created_at, id, or rating'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('sortOrder must be ASC or DESC'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const userIdParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a valid positive integer'),
];

const storeIdParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Store ID must be a valid positive integer'),
];

const bulkUserRoleValidator = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be a non-empty array of user IDs'),
  body('userIds.*')
    .isInt({ min: 1 })
    .withMessage('Each user ID must be a valid positive integer'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'normal_user', 'store_owner'])
    .withMessage('Role must be admin, normal_user, or store_owner'),
];

const bulkUserDeleteValidator = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be a non-empty array of user IDs'),
  body('userIds.*')
    .isInt({ min: 1 })
    .withMessage('Each user ID must be a valid positive integer'),
];

const bulkStoreDeleteValidator = [
  body('storeIds')
    .isArray({ min: 1 })
    .withMessage('storeIds must be a non-empty array of store IDs'),
  body('storeIds.*')
    .isInt({ min: 1 })
    .withMessage('Each store ID must be a valid positive integer'),
];

module.exports = {
  createUserValidator,
  createStoreValidator,
  listUsersValidator,
  listStoresValidator,
  userIdParamValidator,
  storeIdParamValidator,
  bulkUserRoleValidator,
  bulkUserDeleteValidator,
  bulkStoreDeleteValidator,
};

