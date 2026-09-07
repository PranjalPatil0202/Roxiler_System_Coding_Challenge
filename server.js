const app = require('./src/app');
const config = require('./src/config/config');
const { sequelize, testConnection } = require('./src/config/database');
// Import models to ensure associations are registered
require('./src/models');

const startServer = async () => {
  try {
    // Authenticate database connection
    await testConnection();

    // Sync database schema (safe sync without alter on sqlite)
    const shouldAlter = config.db.dialect === 'postgres' && config.nodeEnv === 'development';
    await sequelize.sync({ alter: shouldAlter });
    console.log('✓ Database synchronized successfully');

    // Start listening
    const server = app.listen(config.port, () => {
      console.log(`=================================================`);
      console.log(`🚀 Server running in ${config.nodeEnv} mode on port ${config.port}`);
      console.log(`📡 API Base URL: http://localhost:${config.port}/api`);
      console.log(`=================================================`);
    });

    // Graceful Shutdown
    const handleShutdown = async (signal) => {
      console.log(`\n${signal} received. Closing HTTP server and database connections...`);
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('✓ Database connection closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error while closing database connection:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
