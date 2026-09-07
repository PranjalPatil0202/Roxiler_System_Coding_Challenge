const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const { optionalAuth } = require('../middleware/auth.middleware');
const {
  listStoresQueryValidator,
  storeIdParamValidator,
} = require('../validators/store.validator');
const { validate } = require('../middleware/validation.middleware');

// Public / optional authenticated endpoints (authenticated users get their own submitted rating)
router.get('/', optionalAuth, listStoresQueryValidator, validate, storeController.listStores);
router.get('/:id', optionalAuth, storeIdParamValidator, validate, storeController.getStoreById);

module.exports = router;
