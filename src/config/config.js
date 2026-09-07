require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    dialect: process.env.DB_DIALECT || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'store_rating_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    ssl: process.env.DB_SSL === 'true',
    storage: process.env.DB_STORAGE || undefined, // For sqlite testing
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_default_development',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '10', 10), // 10 requests per window
  },
};
