const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  submitRatingValidator,
  updateRatingValidator,
} = require('../validators/rating.validator');
const { validate } = require('../middleware/validation.middleware');

// Protect rating endpoints for normal_user
router.use(authenticate, authorize('normal_user'));

router.post('/', submitRatingValidator, validate, ratingController.submitRating);
router.put('/:storeId', updateRatingValidator, validate, ratingController.updateRating);

module.exports = router;
