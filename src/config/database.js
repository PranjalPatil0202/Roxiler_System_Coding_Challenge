const { Sequelize } = require('sequelize');
const config = require('./config');

const dialectOptions = {};

if (config.db.ssl) {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

let sequelize;

if (config.db.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.db.storage || ':memory:',
    logging: config.db.logging,
  });
} else {
  sequelize = new Sequelize(
    config.db.database,
    config.db.username,
    config.db.password,
    {
      host: config.db.host,
      port: config.db.port,
      dialect: config.db.dialect,
      logging: config.db.logging,
      dialectOptions,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        underscored: true,
        timestamps: true,
      },
    }
  );
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✓ Database connected successfully (${config.db.dialect})`);
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error.message);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
};
