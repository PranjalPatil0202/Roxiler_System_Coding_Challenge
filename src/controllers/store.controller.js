const { Op, fn, col, literal } = require('sequelize');
const { Store, Rating, User, sequelize } = require('../models');

const getLikeOperator = () => {
  return sequelize.getDialect() === 'postgres' ? Op.iLike : Op.like;
};

/**
 * GET /api/stores
 * List all stores with overall rating + the logged-in user's own rating (if logged in)
 * Supports search by name, address, sorting, and pagination
 */
const listStores = async (req, res, next) => {
  try {
    const {
      search,
      name,
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
        { address: { [likeOp]: `%${search}%` } },
      ];
    } else {
      if (name) where.name = { [likeOp]: `%${name}%` };
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
      order: orderClause,
      limit: parsedLimit,
      offset,
      subQuery: false,
    });

    const totalCount = Array.isArray(count) ? count.length : count;

    // If a user is logged in, fetch their submitted ratings for these stores in one batch
    let userRatingsMap = {};
    if (req.user && req.user.id) {
      const storeIds = rows.map((s) => s.id);
      if (storeIds.length > 0) {
        const userRatings = await Rating.findAll({
          where: {
            user_id: req.user.id,
            store_id: { [Op.in]: storeIds },
          },
        });
        userRatings.forEach((r) => {
          userRatingsMap[r.store_id] = r.rating;
        });
      }
    }

    const formattedStores = rows.map((store) => {
      const plain = store.toJSON();
      plain.average_rating = parseFloat(Number(plain.average_rating || 0).toFixed(2));
      plain.rating_count = parseInt(plain.rating_count || 0, 10);
      plain.userRating = userRatingsMap[store.id] !== undefined ? userRatingsMap[store.id] : null;
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
 * GET /api/stores/:id
 * Get single store detail with overall rating and user's own rating
 */
const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id, {
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: [],
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
      ],
      attributes: {
        include: [
          [fn('COALESCE', fn('AVG', col('ratings.rating')), 0), 'average_rating'],
          [fn('COUNT', col('ratings.id')), 'rating_count'],
        ],
      },
      group: ['Store.id', 'owner.id'],
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: `Store with ID ${id} not found`,
      });
    }

    let userRating = null;
    if (req.user && req.user.id) {
      const ratingRecord = await Rating.findOne({
        where: {
          user_id: req.user.id,
          store_id: id,
        },
      });
      if (ratingRecord) {
        userRating = ratingRecord.rating;
      }
    }

    // Calculate real star rating distribution breakdown (1 to 5 stars)
    const distributionCounts = await Rating.findAll({
      where: { store_id: id },
      attributes: ['rating', [fn('COUNT', col('id')), 'count']],
      group: ['rating'],
      raw: true,
    });

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distributionCounts.forEach((dc) => {
      ratingDistribution[dc.rating] = parseInt(dc.count, 10);
    });

    const result = store.toJSON();
    result.average_rating = parseFloat(Number(result.average_rating || 0).toFixed(2));
    result.rating_count = parseInt(result.rating_count || 0, 10);
    result.userRating = userRating;
    result.ratingDistribution = ratingDistribution;

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listStores,
  getStoreById,
};
