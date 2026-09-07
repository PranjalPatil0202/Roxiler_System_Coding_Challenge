const { query, param } = require('express-validator');

const listStoresQueryValidator = [
  query('search')
    .optional()
    .isString()
    .trim(),

  query('name')
    .optional()
    .isString()
    .trim(),

  query('address')
    .optional()
    .isString()
    .trim(),

  query('sortBy')
    .optional()
    .isIn(['name', 'address', 'rating', 'created_at', 'id'])
    .withMessage('sortBy must be name, address, rating, created_at, or id'),

  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC', 'asc', 'desc'])
    .withMessage('sortOrder must be ASC or DESC'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt(),
];

const storeIdParamValidator = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Store ID must be a valid positive integer'),
];

module.exports = {
  listStoresQueryValidator,
  storeIdParamValidator,
};
