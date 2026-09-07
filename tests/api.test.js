process.env.NODE_ENV = 'test';
process.env.RATE_LIMIT_MAX = '1000'; // Higher limit during test execution

const http = require('http');
const app = require('../src/app');
const { sequelize } = require('../src/models');
const seedDatabase = require('../src/seeds/seed');

let server;
let baseUrl;

const request = async (method, path, body = null, token = null) => {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = {
    method,
    headers,
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = null;
  }
  return { status: res.status, headers: res.headers, data };
};

const runTests = async () => {
  console.log('\n========================================');
  console.log('       RUNNING BACKEND API TESTS        ');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extra = '') => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} ${extra}`);
      failed++;
    }
  };

  try {
    // 1. Seed database
    console.log('1. Setting up database and running seed...');
    await seedDatabase();

    // 2. Start test server on dynamic port
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        console.log(`✓ Test server listening at ${baseUrl}\n`);
        resolve();
      });
    });

    console.log('2. Authentication & Registration Tests');
    // Test normal user registration
    const regRes = await request('POST', '/auth/register', {
      name: 'Freshly Registered Test User', // 28 chars
      email: 'testnewuser@example.com',
      password: 'User@Password99',
      address: '999 Testing Way, Suite 10, Test City',
    });
    assert(regRes.status === 201 && regRes.data.token, 'Register normal_user returns 201 & token');
    assert(regRes.data.user.role === 'normal_user', 'Registered user role forced to normal_user');

    // Test registration validation errors
    const shortNameRes = await request('POST', '/auth/register', {
      name: 'Short Name', // < 20 chars
      email: 'short@example.com',
      password: 'User@Password99',
      address: 'Some Address',
    });
    assert(shortNameRes.status === 400, 'Register with name < 20 chars fails with 400');

    const weakPassRes = await request('POST', '/auth/register', {
      name: 'Valid Name Between Twenty And Sixty Chars',
      email: 'weakpass@example.com',
      password: 'weakpassword', // No uppercase, no special char
      address: 'Some Address',
    });
    assert(weakPassRes.status === 400, 'Register with password missing uppercase/special char fails with 400');

    // Test login
    const loginAdmin = await request('POST', '/auth/login', {
      email: 'admin@example.com',
      password: 'Admin@Password1',
    });
    assert(loginAdmin.status === 200 && loginAdmin.data.token, 'Admin login succeeds with 200 and token');
    const adminToken = loginAdmin.data.token;

    const loginUser = await request('POST', '/auth/login', {
      email: 'user1@example.com',
      password: 'User@Password1',
    });
    assert(loginUser.status === 200, 'Normal user login succeeds');
    const userToken = loginUser.data.token;

    const loginOwner = await request('POST', '/auth/login', {
      email: 'owner1@example.com',
      password: 'Owner@Password1',
    });
    assert(loginOwner.status === 200, 'Store owner login succeeds');
    const ownerToken = loginOwner.data.token;

    console.log('\n3. Admin Operations Tests');
    // Admin Dashboard
    const dashRes = await request('GET', '/admin/dashboard', null, adminToken);
    assert(dashRes.status === 200, 'Admin dashboard returns 200');
    assert(
      typeof dashRes.data.data.totalUsers === 'number' &&
      typeof dashRes.data.data.totalStores === 'number' &&
      typeof dashRes.data.data.totalRatings === 'number' &&
      dashRes.data.data.userCountsByRole !== undefined,
      'Admin dashboard contains totalUsers, totalStores, totalRatings, and userCountsByRole'
    );

    // Non-admin accessing dashboard should be forbidden (403)
    const forbiddenDash = await request('GET', '/admin/dashboard', null, userToken);
    assert(forbiddenDash.status === 403, 'Normal user accessing admin dashboard returns 403 Forbidden');

    // Admin create user with store_owner role
    const createOwnerRes = await request('POST', '/admin/users', {
      name: 'Third Brand New Store Owner',
      email: 'owner3@example.com',
      password: 'Owner@Password3',
      address: '777 Commerce St, Trade Center',
      role: 'store_owner',
    }, adminToken);
    assert(createOwnerRes.status === 201 && createOwnerRes.data.data.role === 'store_owner', 'Admin creates store_owner user');
    const newOwnerId = createOwnerRes.data.data.id;

    // Admin create store with nullable owner_id
    const createStoreNoOwner = await request('POST', '/admin/stores', {
      name: 'Standalone Boutique Marketplace', // 32 chars
      email: 'boutique@example.com',
      address: '888 Boulevard Way, Fashion Avenue',
      owner_id: null,
    }, adminToken);
    assert(createStoreNoOwner.status === 201, 'Admin creates store with owner_id = null');

    // Admin create store assigned to store owner
    const createStoreWithOwner = await request('POST', '/admin/stores', {
      name: 'Third Electronics Mega Mart', // 27 chars
      email: 'megamart@example.com',
      address: '999 Tech Plaza, Innovation District',
      owner_id: newOwnerId,
    }, adminToken);
    assert(createStoreWithOwner.status === 201 && createStoreWithOwner.data.data.owner_id === newOwnerId, 'Admin creates store assigned to owner_id');

    // Admin list users with filters & sorting
    const listUsersRes = await request('GET', '/admin/users?role=store_owner&sortBy=name&sortOrder=ASC', null, adminToken);
    assert(listUsersRes.status === 200 && listUsersRes.data.data.length >= 3, 'Admin lists users filtered by role=store_owner');

    // Admin list stores
    const listAdminStoresRes = await request('GET', '/admin/stores?sortBy=rating&sortOrder=DESC', null, adminToken);
    assert(listAdminStoresRes.status === 200 && listAdminStoresRes.data.data.length >= 5, 'Admin lists stores with computed average rating');

    // Admin get user detail for store owner
    const getOwnerDetail = await request('GET', `/admin/users/${newOwnerId}`, null, adminToken);
    assert(getOwnerDetail.status === 200 && getOwnerDetail.data.data.stores !== undefined, 'Admin get user detail includes owned stores & avg rating');

    console.log('\n4. Stores Route Tests (Public / User Rating Context)');
    // List stores authenticated as user1 (who has rated store 1 and store 2)
    const storesUserRes = await request('GET', '/stores?sortBy=name', null, userToken);
    assert(storesUserRes.status === 200, 'GET /stores succeeds');
    const storeWithRating = storesUserRes.data.data.find(s => s.name === 'Downtown Electronics Mega Hub');
    assert(storeWithRating && storeWithRating.userRating === 5, 'GET /stores includes current logged-in user rating (5)');

    // Search stores by name
    const searchRes = await request('GET', '/stores?search=Organic', null);
    assert(searchRes.status === 200 && searchRes.data.data.length >= 1, 'GET /stores?search=Organic returns matching stores');

    console.log('\n5. Ratings Operations Tests');
    // Normal user submits rating for store 3
    const submitRatingRes = await request('POST', '/ratings', {
      store_id: 3,
      rating: 5,
    }, userToken);
    assert(submitRatingRes.status === 201 || submitRatingRes.status === 200, 'Normal user submits rating (5) for store 3');

    // Normal user updates rating for store 1 (e.g. from 5 to 4)
    const updateRatingRes = await request('PUT', '/ratings/1', {
      rating: 4,
    }, userToken);
    assert(updateRatingRes.status === 200 && updateRatingRes.data.data.rating === 4, 'Normal user updates rating to 4');

    // Store owner cannot rate stores (only normal_user allowed)
    const ownerRateAttempt = await request('POST', '/ratings', {
      store_id: 1,
      rating: 5,
    }, ownerToken);
    assert(ownerRateAttempt.status === 403, 'Store owner cannot submit ratings (403 Forbidden)');

    console.log('\n6. Store Owner Portal Tests');
    // Store owner views users who rated their store
    const ownerRatingsRes = await request('GET', '/store-owner/ratings', null, ownerToken);
    assert(ownerRatingsRes.status === 200 && Array.isArray(ownerRatingsRes.data.data), 'Store owner lists users who rated their store');

    // Store owner views stats & rating breakdown
    const ownerStatsRes = await request('GET', '/store-owner/stats', null, ownerToken);
    assert(
      ownerStatsRes.status === 200 &&
      ownerStatsRes.data.data.averageRating !== undefined &&
      ownerStatsRes.data.data.ratingDistribution !== undefined,
      'Store owner gets average rating and rating distribution breakdown'
    );

    console.log('\n7. User Password Update Tests');
    // User updates password (password must be 8-16 chars, 1+ uppercase, 1+ special char)
    const updatePassRes = await request('PATCH', '/users/update-password', {
      oldPassword: 'User@Password1',
      newPassword: 'NewPass@12345', // 13 chars
    }, userToken);
    assert(updatePassRes.status === 200, 'User successfully updates own password');

    // Test logging in with new password
    const loginNewPass = await request('POST', '/auth/login', {
      email: 'user1@example.com',
      password: 'NewPass@12345',
    });
    assert(loginNewPass.status === 200, 'User logs in successfully with new password');

    // Test old password no longer works
    const loginOldPass = await request('POST', '/auth/login', {
      email: 'user1@example.com',
      password: 'User@Password1',
    });
    assert(loginOldPass.status === 401, 'Old password fails with 401');

    // Restore user1 password back to default so UI demo pills and manual login work
    if (loginNewPass.data && loginNewPass.data.token) {
      await request(
        'PATCH',
        '/users/update-password',
        {
          oldPassword: 'NewPass@12345',
          newPassword: 'User@Password1',
        },
        loginNewPass.data.token
      );
    }

    console.log('\n8. Bulk Operations, Search, Ratings Feed & Distribution Tests');
    // Test Admin Search Users
    const searchUsersRes = await request('GET', '/admin/users?search=Freshly', null, adminToken);
    assert(searchUsersRes.status === 200 && searchUsersRes.data.data.some(u => u.email === 'testnewuser@example.com'), 'Admin GET /admin/users?search=Freshly returns matching user');

    // Test Admin Search Stores
    const searchStoresRes = await request('GET', '/admin/stores?search=Boutique', null, adminToken);
    assert(searchStoresRes.status === 200 && searchStoresRes.data.data.some(s => s.name.includes('Boutique')), 'Admin GET /admin/stores?search=Boutique returns matching store');

    // Test Admin GET /admin/ratings
    const adminRatingsRes = await request('GET', '/admin/ratings?limit=10', null, adminToken);
    assert(
      adminRatingsRes.status === 200 &&
      Array.isArray(adminRatingsRes.data.data) &&
      adminRatingsRes.data.data.length > 0 &&
      adminRatingsRes.data.data[0].user !== undefined &&
      adminRatingsRes.data.data[0].store !== undefined,
      'Admin GET /admin/ratings returns ratings with user and store associations'
    );

    // Test GET /stores/:id includes real ratingDistribution
    const storeDetailRes = await request('GET', '/stores/1', null, userToken);
    assert(
      storeDetailRes.status === 200 &&
      storeDetailRes.data.data.ratingDistribution &&
      typeof storeDetailRes.data.data.ratingDistribution['5'] === 'number',
      'GET /stores/:id returns real ratingDistribution breakdown'
    );

    // Test Bulk User Role Update
    const bulkRoleRes = await request('PATCH', '/admin/users/bulk-role', {
      userIds: [newOwnerId],
      role: 'normal_user',
    }, adminToken);
    assert(bulkRoleRes.status === 200 && bulkRoleRes.data.data.updatedCount >= 1, 'Admin bulk updates user role to normal_user');

    // Verify role was updated in database
    const verifyUpdatedUser = await request('GET', `/admin/users/${newOwnerId}`, null, adminToken);
    assert(verifyUpdatedUser.status === 200 && verifyUpdatedUser.data.data.role === 'normal_user', 'User role persisted as normal_user after bulk update');

    // Test Bulk Delete Stores
    const bulkStoreDeleteRes = await request('DELETE', '/admin/stores/bulk', {
      storeIds: [createStoreNoOwner.data.data.id],
    }, adminToken);
    assert(bulkStoreDeleteRes.status === 200 && bulkStoreDeleteRes.data.data.deletedCount >= 1, 'Admin bulk deletes stores');

    // Test Bulk Delete Users
    const bulkUserDeleteRes = await request('DELETE', '/admin/users/bulk', {
      userIds: [newOwnerId],
    }, adminToken);
    assert(bulkUserDeleteRes.status === 200 && bulkUserDeleteRes.data.data.deletedCount >= 1, 'Admin bulk deletes users');

    // Verify user is deleted
    const verifyDeletedUser = await request('GET', `/admin/users/${newOwnerId}`, null, adminToken);
    assert(verifyDeletedUser.status === 404, 'Deleted user returns 404 Not Found');

    console.log('\n========================================');
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log('========================================\n');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await sequelize.close();
  }
};

runTests();
