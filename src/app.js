const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    exposedHeaders: ['Content-Disposition'],
  })
);

// HTTP Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Store Rating Platform API',
    docs: '/api/health',
  });
});

// API Routes
app.use('/api', routes);

// 404 Route Not Found Handler
app.use(notFoundHandler);

// Centralized Global Error Handler
app.use(errorHandler);

module.exports = app;
