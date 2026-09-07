const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const {
  createUserValidator,
  createStoreValidator,
  listUsersValidator,
  listStoresValidator,
  userIdParamValidator,
  storeIdParamValidator,
  bulkUserRoleValidator,
  bulkUserDeleteValidator,
  bulkStoreDeleteValidator,
} = require('../validators/admin.validator');
const { validate } = require('../middleware/validation.middleware');

// Protect all admin routes with authentication and admin role authorization
router.use(authenticate, authorize('admin'));

// Dashboard stats & telemetry
router.get('/dashboard', adminController.getDashboardStats);
router.get('/ratings', adminController.listRatings);

// User management
router.post('/users', createUserValidator, validate, adminController.createUser);
router.get('/users', listUsersValidator, validate, adminController.listUsers);
router.patch('/users/bulk-role', bulkUserRoleValidator, validate, adminController.bulkUpdateUserRole);
router.delete('/users/bulk', bulkUserDeleteValidator, validate, adminController.bulkDeleteUsers);
router.get('/users/:id', userIdParamValidator, validate, adminController.getUserDetail);
router.delete('/users/:id', userIdParamValidator, validate, adminController.deleteUser);

// Store management
router.post('/stores', createStoreValidator, validate, adminController.createStore);
router.get('/stores', listStoresValidator, validate, adminController.listStores);
router.delete('/stores/bulk', bulkStoreDeleteValidator, validate, adminController.bulkDeleteStores);
router.delete('/stores/:id', storeIdParamValidator, validate, adminController.deleteStore);

// Direct CSV Exports (Native Content-Disposition Downloads)
router.get('/export/users', adminController.exportUsersCSV);
router.get('/export/stores', adminController.exportStoresCSV);

module.exports = router;

