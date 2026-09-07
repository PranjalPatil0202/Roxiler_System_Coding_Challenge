const rateLimit = require('express-rate-limit');
const config = require('../config/config');

const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes by default
  max: config.rateLimit.max, // 10 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
  },
});

module.exports = {
  authLimiter,
};
