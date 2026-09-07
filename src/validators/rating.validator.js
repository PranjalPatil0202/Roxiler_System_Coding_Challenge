const { body, param } = require('express-validator');

const submitRatingValidator = [
  body('store_id')
    .notEmpty().withMessage('store_id is required')
    .isInt({ min: 1 }).withMessage('store_id must be a valid positive integer'),

  body('rating')
    .notEmpty().withMessage('rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('rating must be an integer between 1 and 5'),
];

const updateRatingValidator = [
  param('storeId')
    .isInt({ min: 1 })
    .withMessage('storeId must be a valid positive integer'),

  body('rating')
    .notEmpty().withMessage('rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('rating must be an integer between 1 and 5'),
];

module.exports = {
  submitRatingValidator,
  updateRatingValidator,
};
