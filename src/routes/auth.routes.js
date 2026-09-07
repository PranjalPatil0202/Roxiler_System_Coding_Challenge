const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { validate } = require('../middleware/validation.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);

module.exports = router;
