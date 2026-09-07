const { sequelize } = require('../config/database');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// User <-> Store Associations
User.hasMany(Store, {
  foreignKey: 'owner_id',
  as: 'stores',
  onDelete: 'SET NULL',
});
Store.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner',
});

// User <-> Rating Associations
User.hasMany(Rating, {
  foreignKey: 'user_id',
  as: 'ratings',
  onDelete: 'CASCADE',
});
Rating.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Store <-> Rating Associations
Store.hasMany(Rating, {
  foreignKey: 'store_id',
  as: 'ratings',
  onDelete: 'CASCADE',
});
Rating.belongsTo(Store, {
  foreignKey: 'store_id',
  as: 'store',
});

module.exports = {
  sequelize,
  User,
  Store,
  Rating,
};
