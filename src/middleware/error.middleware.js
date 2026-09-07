const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route Not Found`,
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fieldErrors = err.errors ? err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    })) : [];

    return res.status(409).json({
      success: false,
      message: err.errors && err.errors.length > 0 ? err.errors[0].message : 'Duplicate record error',
      errors: fieldErrors,
    });
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Database validation failed',
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Referenced foreign key entity does not exist',
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid JWT token',
    });
  }

  // Default Internal Server Error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
