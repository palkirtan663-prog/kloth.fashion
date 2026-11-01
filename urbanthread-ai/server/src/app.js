const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { dbState } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const chatRoutes = require('./routes/chatRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const customRequestRoutes = require('./routes/customRequestRoutes');
const supportRoutes = require('./routes/supportRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// The app is built from an explicit config object (see config/env.js) so it never reads secrets by itself.
function createApp(config) {
  const app = express();
  app.disable('x-powered-by');
  app.locals.config = config;

  // Resilient CORS: allows configured origins, localhost/127.0.0.1/IPv6 on any port, and non-browser clients
  const allowedOrigins = (config.clientOrigins || []).map((o) => o.toLowerCase());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const lower = origin.toLowerCase();
        if (allowedOrigins.includes(lower)) return callback(null, true);
        if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(lower)) {
          return callback(null, true);
        }
        if (/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(lower)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Static serving for public images fallback
  const publicImagesDir = path.join(__dirname, '..', '..', 'client', 'public', 'images');
  app.use('/images', express.static(publicImagesDir));

  app.get('/api/health', (req, res) => {
    const state = dbState();
    const isLiveMongo = state === 'connected';
    const isLocalFallback = state === 'local-storage';

    res.status(isLiveMongo || isLocalFallback ? 200 : 503).json({
      ok: true,
      status: 'operational',
      database: {
        state,
        type: isLiveMongo ? 'mongodb-atlas' : (isLocalFallback ? 'local-fallback' : 'disconnected'),
        isAtlasLive: isLiveMongo,
        notice: isLiveMongo
          ? 'Live MongoDB Atlas cluster connected'
          : (isLocalFallback
              ? 'Local storage fallback active (Atlas requires IP whitelisting in cloud.mongodb.com)'
              : 'Database disconnected'),
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/custom-requests', customRequestRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/marketing', marketingRoutes);
  app.use('/api', marketingRoutes);
  app.use('/api/upload', uploadRoutes);


  // Production static serving of React client
  const clientDistDir = path.join(__dirname, '..', '..', 'client', 'dist');
  if (fs.existsSync(clientDistDir)) {
    app.use(express.static(clientDistDir));
  }

  // Handle unmatched API endpoints with a JSON 404
  app.use('/api', notFound);

  // Client SPA fallback: for any GET route not starting with /api or /images, serve index.html
  if (fs.existsSync(clientDistDir)) {
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/images')) {
        return res.sendFile(path.join(clientDistDir, 'index.html'));
      }
      next();
    });
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
