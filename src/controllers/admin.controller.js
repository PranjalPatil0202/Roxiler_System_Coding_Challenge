const { Op, fn, col, literal } = require('sequelize');
const { User, Store, Rating, sequelize } = require('../models');

// Safe LIKE operator based on dialect
const getLikeOperator = () => {
  return sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
};

/**
 * GET /api/admin/dashboard
 * Aggregated platform statistics
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.count();
    const totalStores = await Store.count();
    const totalRatings = await Rating.count();

    // User counts grouped by role
    const roleCounts = await User.findAll({
      attributes: ['role', [fn('COUNT', col('id')), 'count']],
      group: ['role'],
      raw: true,
    });

    const userCountsByRole = {
      admin: 0,
      normal_user: 0,
      store_owner: 0,
    };

    roleCounts.forEach((rc) => {
      userCountsByRole[rc.role] = parseInt(rc.count, 10);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalStores,
        totalRatings,
        userCountsByRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/users
 * Admin creates a user with any valid role (admin, normal_user, store_owner)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      address,
      role: role || 'normal_user',
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/stores
 * Admin creates a new store with optional owner_id
 */
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // If owner_id is provided, verify user exists
    if (owner_id) {
      const owner = await User.findByPk(owner_id);
      if (!owner) {
        return res.status(404).json({
          success: false,
          message: `Owner user with ID ${owner_id} does not exist`,
        });
      }
      if (owner.role !== 'store_owner') {
        return res.status(400).json({
          success: false,
          message: `User with ID ${owner_id} is a '${owner.role}'. Stores should ideally be assigned to a 'store_owner'.`,
        });
      }
    }

    const store = await Store.create({
      name,
      email,
      address,
      owner_id: owner_id || null,
    });

    // Fetch store with owner details
    const createdStore = await Store.findByPk(store.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'role'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: createdStore,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * List users with filters, sorting, and pagination
 */
const listUsers = async (req, res, next) => {
  try {
    const {
      search,
      name,
      email,
      address,
      role,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = req.query;

    const likeOp = getLikeOperator();
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [likeOp]: `%${search}%` } },
        { email: { [likeOp]: `%${search}%` } },
        { address: { [likeOp]: `%${search}%` } },
      ];
    } else {
      if (name) where.name = { [likeOp]: `%${name}%` };
      if (email) where.email = { [likeOp]: `%${email}%` };
      if (address) where.address = { [likeOp]: `%${address}%` };
    }
    if (role) where.role = role;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const { count, rows } = await User.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parsedLimit,
      offset,
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Store,
          as: 'stores',
          attributes: ['id', 'name'],
          include: [
            {
              model: Rating,
              as: 'ratings',
              attributes: ['rating'],
            },
          ],
        },
      ],
      distinct: true,
    });

    const formattedRows = rows.map((u) => {
      const plain = u.toJSON();
      if (plain.role === 'store_owner' && plain.stores && plain.stores.length > 0) {
        let totalRatingsSum = 0;
        let totalRatingsCount = 0;
        plain.stores.forEach((st) => {
          if (st.ratings && st.ratings.length > 0) {
            st.ratings.forEach((r) => {
              totalRatingsSum += r.rating;
              totalRatingsCount += 1;
            });
          }
        });
        plain.storeRating = totalRatingsCount > 0 ? parseFloat((totalRatingsSum / totalRatingsCount).toFixed(1)) : null;
        plain.storeCount = plain.stores.length;
      }
      return plain;
    });

    return res.status(200).json({
      success: true,
      data: formattedRows,
      pagination: {
        total: count,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(count / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stores
 * List stores with filters, sorting, and computed average rating
 */
const listStores = async (req, res, next) => {
  try {
    const {
      search,
      name,
      email,
      address,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 10,
    } = req.query;

    const likeOp = getLikeOperator();
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [likeOp]: `%${search}%` } },
        { email: { [likeOp]: `%${search}%` } },
        { address: { [likeOp]: `%${search}%` } },
      ];
    } else {
      if (name) where.name = { [likeOp]: `%${name}%` };
      if (email) where.email = { [likeOp]: `%${email}%` };
      if (address) where.address = { [likeOp]: `%${address}%` };
    }

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

    let orderClause;
    if (sortBy === 'rating') {
      orderClause = [[literal('average_rating'), sortOrder.toUpperCase()]];
    } else {
      orderClause = [[sortBy, sortOrder.toUpperCase()]];
    }

    const { count, rows } = await Store.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email', 'role'],
        },
        {
          model: Rating,
          as: 'ratings',
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [fn('COALESCE', fn('AVG', col('ratings.rating')), 0), 'average_rating'],
          [fn('COUNT', col('ratings.id')), 'rating_count'],
        ],
      },
      group: ['Store.id', 'owner.id'],
      order: orderClause,
      limit: parsedLimit,
      offset,
      subQuery: false,
    });

    // In Sequelize grouped findAndCountAll, count is an array of group counts
    const totalCount = Array.isArray(count) ? count.length : count;

    const formattedStores = rows.map((store) => {
      const plain = store.toJSON();
      plain.average_rating = parseFloat(Number(plain.average_rating || 0).toFixed(2));
      plain.rating_count = parseInt(plain.rating_count || 0, 10);
      return plain;
    });

    return res.status(200).json({
      success: true,
      data: formattedStores,
      pagination: {
        total: totalCount,
        page: parseInt(page, 10),
        limit: parsedLimit,
        totalPages: Math.ceil(totalCount / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users/:id
 * Single user details (includes stores & ratings if store_owner)
 */
const getUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${id} not found`,
      });
    }

    const responseData = user.toJSON();

    if (user.role === 'store_owner') {
      // Fetch owned stores with individual store average rating
      const stores = await Store.findAll({
        where: { owner_id: user.id },
        include: [
          {
            model: Rating,
            as: 'ratings',
            attributes: [],
          },
        ],
        attributes: {
          include: [
            [fn('COALESCE', fn('AVG', col('ratings.rating')), 0), 'average_rating'],
            [fn('COUNT', col('ratings.id')), 'rating_count'],
          ],
        },
        group: ['Store.id'],
      });

      const formattedStores = stores.map((st) => {
        const p = st.toJSON();
        p.average_rating = parseFloat(Number(p.average_rating || 0).toFixed(2));
        p.rating_count = parseInt(p.rating_count || 0, 10);
        return p;
      });

      // Compute overall average rating across all owned stores
      let totalRatingSum = 0;
      let totalRatingCount = 0;

      for (const st of formattedStores) {
        totalRatingSum += st.average_rating * st.rating_count;
        totalRatingCount += st.rating_count;
      }

      const overallAverageRating =
        totalRatingCount > 0
          ? parseFloat((totalRatingSum / totalRatingCount).toFixed(2))
          : 0;

      responseData.stores = formattedStores;
      responseData.averageRating = overallAverageRating;
      responseData.totalRatingsCount = totalRatingCount;
    } else if (user.role === 'normal_user') {
      // Include ratings submitted by this normal user
      const submittedRatings = await Rating.findAll({
        where: { user_id: user.id },
        include: [
          {
            model: Store,
            as: 'store',
            attributes: ['id', 'name', 'address'],
          },
        ],
      });
      responseData.submittedRatings = submittedRatings;
    }

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/export/users
 * Streams platform users directly as an RFC 4180 CSV file with UTF-8 BOM
 * Respects active search, filters, and sort order
 */
const exportUsersCSV = async (req, res, next) => {
  try {
    const {
      search,
      name,
      email,
      address,
      role,
      sortBy = 'id',
      sortOrder = 'ASC',
    } = req.query;

    const likeOp = getLikeOperator();
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [likeOp]: `%${search}%` } },
        { email: { [likeOp]: `%${search}%` } },
        { address: { [likeOp]: `%${search}%` } },
      ];
    } else {
      if (name) where.name = { [likeOp]: `%${name}%` };
      if (email) where.email = { [likeOp]: `%${email}%` };
      if (address) where.address = { [likeOp]: `%${address}%` };
    }
    if (role) where.role = role;

    const validSortFields = ['id', 'name', 'email', 'role', 'address', 'created_at'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const users = await User.findAll({
      where,
      order: [[safeSortBy, safeSortOrder]],
      attributes: ['id', 'name', 'email', 'role', 'address', 'created_at'],
    });

    const headers = ['User ID', 'Full Name', 'Email Address', 'Account Role', 'Physical Address', 'Registered Date'];
    const rows = users.map((u) => {
      const roleLabel = u.role === 'admin' ? 'Admin' : u.role === 'store_owner' ? 'Store Owner' : 'Normal User';
      const dateStr = u.created_at
        ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';
      const cleanAddress = (u.address || '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
      const cleanName = (u.name || '').replace(/"/g, '""');
      const cleanEmail = (u.email || '').replace(/"/g, '""');

      return `"${u.id}","${cleanName}","${cleanEmail}","${roleLabel}","${cleanAddress}","${dateStr}"`;
    });

    const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/export/stores
 * Streams stores catalog directly as an RFC 4180 CSV file with UTF-8 BOM
 * Respects active search, filters, and sort order
 */
const exportStoresCSV = async (req, res, next) => {
  try {
    const {
      search,
      name,
      email,
      address,
      sortBy = 'id',
      sortOrder = 'ASC',
    } = req.query;

    const likeOp = getLikeOperator();
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [likeOp]: `%${search}%` } },
        { email: { [likeOp]: `%${search}%` } },
        { address: { [likeOp]: `%${search}%` } },
      ];
    } else {
      if (name) where.name = { [likeOp]: `%${name}%` };
      if (email) where.email = { [likeOp]: `%${email}%` };
      if (address) where.address = { [likeOp]: `%${address}%` };
    }

    const validSortFields = ['id', 'name', 'email', 'address', 'created_at'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const stores = await Store.findAll({
      where,
      order: [[safeSortBy, safeSortOrder]],
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: ['rating'],
        },
      ],
    });

    const headers = ['Store ID', 'Store Name', 'Store Email', 'Store Address', 'Average Rating', 'Total Reviews', 'Registered Date'];
    const rows = stores.map((s) => {
      let ratingCount = 0;
      let ratingSum = 0;
      if (s.ratings && s.ratings.length > 0) {
        ratingCount = s.ratings.length;
        ratingSum = s.ratings.reduce((acc, r) => acc + r.rating, 0);
      }
      const avgRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : '0.0';
      const dateStr = s.created_at
        ? new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';
      const cleanAddress = (s.address || '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
      const cleanName = (s.name || '').replace(/"/g, '""');
      const cleanEmail = (s.email || '').replace(/"/g, '""');

      return `"${s.id}","${cleanName}","${cleanEmail}","${cleanAddress}","${avgRating}","${ratingCount}","${dateStr}"`;
    });

    const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="stores-export.csv"');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/:id
 * Admin deletes a user (supports Undo capability)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: { id: parseInt(id, 10) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/stores/:id
 * Admin deletes a store (supports Undo capability)
 */
const deleteStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found',
      });
    }

    await store.destroy();

    return res.status(200).json({
      success: true,
      message: 'Store deleted successfully',
      data: { id: parseInt(id, 10) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/bulk-role
 * Bulk update role for multiple users
 */
const bulkUpdateUserRole = async (req, res, next) => {
  try {
    const { userIds, role } = req.body;
    const currentAdminId = req.user.id;

    // Prevent admin from changing their own role via bulk update
    const sanitizedIds = userIds.filter((id) => id !== currentAdminId);
    if (sanitizedIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You cannot modify your own administrator role via bulk update.',
      });
    }

    const [updatedCount] = await User.update(
      { role },
      { where: { id: { [Op.in]: sanitizedIds } } }
    );

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedCount} user role(s) to '${role}'`,
      data: { updatedCount, role },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/users/bulk
 * Bulk delete user accounts
 */
const bulkDeleteUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    const currentAdminId = req.user.id;

    // Prevent admin from deleting their own account
    const sanitizedIds = userIds.filter((id) => id !== currentAdminId);
    if (sanitizedIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrator account.',
      });
    }

    const deletedCount = await User.destroy({
      where: { id: { [Op.in]: sanitizedIds } },
    });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} user account(s)`,
      data: { deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/stores/bulk
 * Bulk delete stores
 */
const bulkDeleteStores = async (req, res, next) => {
  try {
    const { storeIds } = req.body;

    const deletedCount = await Store.destroy({
      where: { id: { [Op.in]: storeIds } },
    });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} store(s)`,
      data: { deletedCount },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/ratings
 * List recent platform ratings for dashboard telemetry and charts
 */
const listRatings = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    const ratings = await Rating.findAll({
      limit: Math.min(200, Math.max(1, parseInt(limit, 10))),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'address'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetail,
  deleteUser,
  deleteStore,
  bulkUpdateUserRole,
  bulkDeleteUsers,
  bulkDeleteStores,
  listRatings,
  exportUsersCSV,
  exportStoresCSV,
};


