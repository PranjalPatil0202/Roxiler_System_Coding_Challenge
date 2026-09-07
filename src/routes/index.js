const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const storeRoutes = require('./store.routes');
const ratingRoutes = require('./rating.routes');
const storeOwnerRoutes = require('./storeOwner.routes');
const userRoutes = require('./user.routes');

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Store Rating Platform Backend',
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/ratings', ratingRoutes);
router.use('/store-owner', storeOwnerRoutes);
router.use('/users', userRoutes);

module.exports = router;
