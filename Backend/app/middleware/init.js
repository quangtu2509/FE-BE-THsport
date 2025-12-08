// Backend/app/middleware/init.js
// Middleware initialization

const cors = require('cors');
const express = require('express');
const { app: appConfig } = require('../config/init');
const appMiddleware = require('./App.middleware');
const ErrorHandler = require('./ErrorHandler.middleware');
const { cacheProducts } = require('./cache');

module.exports = (app) => {
  // Trust proxy
  app.set('trust proxy', 1);

  // CORS
  app.use(cors(appConfig.cors));

  // Body parser
  app.use(express.json({ limit: appConfig.request.jsonLimit }));
  app.use(express.urlencoded({
    limit: appConfig.request.urlencodedLimit,
    extended: true
  }));

  // UTF-8 Encoding for API routes only
  app.use('/api', (req, res, next) => {
    res.charset = 'utf-8';
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // App middleware
  appMiddleware(app);

  // Cache middleware
  app.use('/api/products', cacheProducts);

  // Error handler (must be last)
  app.use((err, req, res, next) => {
    ErrorHandler.handle(err, req, res, next);
  });
};
