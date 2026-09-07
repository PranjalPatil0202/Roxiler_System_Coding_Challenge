const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

class User extends Model {
  // Check if given plain-text password matches the hashed password
  async isValidPassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }

  // Safe object for JSON responses (omits password)
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}

User.init(
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
          msg: 'User name must be between 20 and 60 characters',
        },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'Email address already in use',
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address',
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: true,
      validate: {
        len: {
          args: [0, 400],
          msg: 'Address cannot exceed 400 characters',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'normal_user', 'store_owner'),
      allowNull: false,
      defaultValue: 'normal_user',
      validate: {
        isIn: {
          args: [['admin', 'normal_user', 'store_owner']],
          msg: 'Role must be either admin, normal_user, or store_owner',
        },
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

module.exports = User;
