const { sequelize, User, Store, Rating } = require('../models');

const seedDatabase = async ({ force = true } = {}) => {
  try {
    console.log('--- Starting Database Seeding ---');

    // Authenticate and sync tables (force: true drops and recreates tables, false preserves)
    await sequelize.authenticate();
    if (force) {
      await sequelize.sync({ force: true });
      console.log('✓ Database schema synchronized (tables recreated)');
    } else {
      await sequelize.sync();
      console.log('✓ Database schema synchronized');
    }

    // 1. Create Admin User
    const admin = await User.create({
      name: 'System Administrator Master User', // 34 chars (20-60 chars)
      email: 'admin@example.com',
      password: 'Admin@Password1', // 8-16 chars, uppercase, special char
      address: '777 Tech Boulevard, Headquarters, Silicon Valley',
      role: 'admin',
    });
    console.log(`✓ Created Admin: ${admin.email} / Admin@Password1`);

    // 2. Create Store Owners
    const owner1 = await User.create({
      name: 'Store Owner Alpha Enterprise', // 28 chars
      email: 'owner1@example.com',
      password: 'Owner@Password1',
      address: '101 Market Street, Commercial Hub, Metropolis',
      role: 'store_owner',
    });

    const owner2 = await User.create({
      name: 'Store Owner Beta Electronics', // 28 chars
      email: 'owner2@example.com',
      password: 'Owner@Password2',
      address: '202 Retail Plaza, Downtown District, Metropolis',
      role: 'store_owner',
    });
    console.log(`✓ Created Store Owners: ${owner1.email}, ${owner2.email}`);

    // 3. Create Normal Users
    const user1 = await User.create({
      name: 'Johnathan Alexander Doe User', // 28 chars
      email: 'user1@example.com',
      password: 'User@Password1',
      address: '303 Maple Avenue, Residential Colony, Metropolis',
      role: 'normal_user',
    });

    const user2 = await User.create({
      name: 'Jane Elizabeth Smith Customer', // 29 chars
      email: 'user2@example.com',
      password: 'User@Password2',
      address: '404 Oak Street, Green Valley, Metropolis',
      role: 'normal_user',
    });

    const user3 = await User.create({
      name: 'Alice Johnson Platform Member', // 29 chars
      email: 'user3@example.com',
      password: 'User@Password3',
      address: '505 Pine Road, Sunset Heights, Metropolis',
      role: 'normal_user',
    });
    console.log(`✓ Created Normal Users: ${user1.email}, ${user2.email}, ${user3.email}`);

    // 4. Create Stores (20-60 char names, max 400 char address)
    const store1 = await Store.create({
      name: 'Downtown Electronics Mega Hub', // 28 chars
      email: 'store1@example.com',
      address: '123 Main Street, Suite 100, City Center',
      owner_id: owner1.id,
    });

    const store2 = await Store.create({
      name: 'Organic Harvest Grocery Depot', // 28 chars
      email: 'store2@example.com',
      address: '456 Elm Street, Market Square, East Side',
      owner_id: owner2.id,
    });

    const store3 = await Store.create({
      name: 'Urban Fashion Apparel Outlet', // 27 chars
      email: 'store3@example.com',
      address: '789 Broadway Ave, Fashion District, Uptown',
      owner_id: null, // Nullable owner_id demonstration
    });
    console.log(`✓ Created Stores: "${store1.name}", "${store2.name}", "${store3.name}"`);

    // 5. Create Sample Ratings
    const ratingsData = [
      { user_id: user1.id, store_id: store1.id, rating: 5 },
      { user_id: user1.id, store_id: store2.id, rating: 4 },
      { user_id: user2.id, store_id: store1.id, rating: 4 },
      { user_id: user2.id, store_id: store2.id, rating: 3 },
      { user_id: user3.id, store_id: store1.id, rating: 5 },
      { user_id: user3.id, store_id: store3.id, rating: 4 },
    ];

    await Rating.bulkCreate(ratingsData);
    console.log(`✓ Created ${ratingsData.length} sample ratings across stores`);

    console.log('--- Database Seeding Completed Successfully ---');
    console.log('\nSample Credentials:');
    console.log(' Admin:       admin@example.com   / Admin@Password1');
    console.log(' Store Owner: owner1@example.com  / Owner@Password1');
    console.log(' Store Owner: owner2@example.com  / Owner@Password2');
    console.log(' Normal User: user1@example.com   / User@Password1');
    console.log(' Normal User: user2@example.com   / User@Password2');
    console.log(' Normal User: user3@example.com   / User@Password3');

    if (require.main === module) {
      await sequelize.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('✗ Database seeding failed:', error);
    if (require.main === module) {
      await sequelize.close();
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
