const { sequelize, User } = require('../models');
const seedDatabase = require('./seed');

const runAutoSeed = async () => {
  try {
    await sequelize.authenticate();
    // Synchronize schema safely if tables don't exist yet (does not drop tables)
    await sequelize.sync();

    const count = await User.count();
    if (count === 0) {
      console.log('📦 Database is empty (0 users found). Running initial database seed...');
      await seedDatabase({ force: false });
      console.log('✓ Initial seed completed successfully.');
    } else {
      console.log(`ℹ Database already contains ${count} existing user(s). Skipping seed to preserve persistent data.`);
    }

    if (require.main === module) {
      await sequelize.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('✗ Auto-seed execution failed:', error);
    if (require.main === module) {
      await sequelize.close();
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  runAutoSeed();
}

module.exports = runAutoSeed;
