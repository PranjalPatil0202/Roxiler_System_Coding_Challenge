const { Rating, Store } = require('../models');

/**
 * POST /api/ratings
 * Submit or upsert a rating for a store (1-5)
 */
const submitRating = async (req, res, next) => {
  try {
    const { store_id, rating } = req.body;
    const userId = req.user.id;

    // Verify store exists
    const store = await Store.findByPk(store_id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: `Store with ID ${store_id} not found`,
      });
    }

    // Check if user has already rated this store
    let existingRating = await Rating.findOne({
      where: {
        user_id: userId,
        store_id,
      },
    });

    if (existingRating) {
      existingRating.rating = rating;
      await existingRating.save();

      return res.status(200).json({
        success: true,
        message: 'Your rating for this store has been updated',
        data: existingRating,
      });
    }

    const newRating = await Rating.create({
      user_id: userId,
      store_id,
      rating,
    });

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: newRating,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/ratings/:storeId
 * Update own existing rating for a store
 */
const updateRating = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: `Store with ID ${storeId} not found`,
      });
    }

    const ratingRecord = await Rating.findOne({
      where: {
        user_id: userId,
        store_id: storeId,
      },
    });

    if (!ratingRecord) {
      return res.status(404).json({
        success: false,
        message: 'No previous rating found for this store. Use POST /api/ratings to submit a new rating.',
      });
    }

    ratingRecord.rating = rating;
    await ratingRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: ratingRecord,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitRating,
  updateRating,
};
