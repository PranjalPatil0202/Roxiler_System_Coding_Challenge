const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Store extends Model {}

Store.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: {
          args: [20, 60],
          msg: 'Store name must be between 20 and 60 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Must be a valid store email address',
        },
      },
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
      validate: {
        len: {
          args: [1, 400],
          msg: 'Store address cannot exceed 400 characters and must not be empty',
        },
      },
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Nullable as per plan adjustment #1
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Store',
    tableName: 'stores',
    underscored: true,
  }
);

module.exports = Store;
