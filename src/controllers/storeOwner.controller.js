const { fn, col, Op } = require('sequelize');
const { Store, Rating, User } = require('../models');

/**
 * GET /api/store-owner/ratings
 * List users who rated stores owned by the authenticated store owner
 */
const getStoreRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    // Find stores owned by this user
    const stores = await Store.findAll({
      where: { owner_id: ownerId },
      attributes: ['id', 'name', 'address'],
    });

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'You do not own any stores yet',
        data: [],
      });
    }

    const storeIds = stores.map((s) => s.id);

    // Find ratings for these stores, including user details
    const ratings = await Rating.findAll({
      where: {
        store_id: { [Op.in]: storeIds },
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'address'],
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name', 'address'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/store-owner/stats
 * Get average rating and stats for store(s) owned by this store owner
 */
const getStoreStats = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const stores = await Store.findAll({
      where: { owner_id: ownerId },
      attributes: ['id', 'name', 'email', 'address', 'created_at'],
    });

    if (stores.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          hasStores: false,
          totalStores: 0,
          totalRatings: 0,
          averageRating: 0,
          stores: [],
        },
      });
    }

    const storeIds = stores.map((s) => s.id);

    // Aggregate stats per store
    const storeStats = await Store.findAll({
      where: { owner_id: ownerId },
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

    // Rating breakdown (distribution 1 to 5 stars) across all owned stores
    const distributionCounts = await Rating.findAll({
      where: {
        store_id: { [Op.in]: storeIds },
      },
      attributes: ['rating', [fn('COUNT', col('id')), 'count']],
      group: ['rating'],
      raw: true,
    });

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distributionCounts.forEach((dc) => {
      ratingDistribution[dc.rating] = parseInt(dc.count, 10);
    });

    // Calculate overall average across all owned stores
    let overallRatingSum = 0;
    let overallRatingCount = 0;

    const formattedStores = storeStats.map((st) => {
      const plain = st.toJSON();
      const avg = parseFloat(Number(plain.average_rating || 0).toFixed(2));
      const count = parseInt(plain.rating_count || 0, 10);
      plain.average_rating = avg;
      plain.rating_count = count;

      overallRatingSum += avg * count;
      overallRatingCount += count;
      return plain;
    });

    const overallAverage =
      overallRatingCount > 0
        ? parseFloat((overallRatingSum / overallRatingCount).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        hasStores: true,
        totalStores: stores.length,
        totalRatings: overallRatingCount,
        averageRating: overallAverage,
        ratingDistribution,
        stores: formattedStores,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStoreRatings,
  getStoreStats,
};
