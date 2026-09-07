const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Rating extends Model {}

Rating.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Rating must be at least 1',
        },
        max: {
          args: [5],
          msg: 'Rating cannot exceed 5',
        },
        isInt: {
          msg: 'Rating must be an integer value between 1 and 5',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'Rating',
    tableName: 'ratings',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'store_id'],
        name: 'unique_user_store_rating',
      },
    ],
  }
);

module.exports = Rating;
