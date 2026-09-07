const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { updatePasswordValidator } = require('../validators/user.validator');
const { validate } = require('../middleware/validation.middleware');

// Protect user routes
router.use(authenticate);

router.patch('/update-password', updatePasswordValidator, validate, userController.updatePassword);
router.get('/me', userController.getProfile);

module.exports = router;
