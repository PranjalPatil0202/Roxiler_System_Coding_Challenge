const express = require('express');
const router = express.Router();
const storeOwnerController = require('../controllers/storeOwner.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Protect store owner endpoints
router.use(authenticate, authorize('store_owner'));

router.get('/ratings', storeOwnerController.getStoreRatings);
router.get('/stats', storeOwnerController.getStoreStats);

module.exports = router;
