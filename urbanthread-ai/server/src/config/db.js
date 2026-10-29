/*
  db.js - reusable MongoDB (Mongoose) connection module.
  Works with MongoDB Atlas (mongodb+srv://) and local MongoDB (mongodb://).
  Only a redacted connection string is ever logged.
*/
const mongoose = require('mongoose');
const { redactUri, describeConnectionError } = require('../utils/dbErrors');

const STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];
let listenersAttached = false;

function dbState() {
  try {
    const { isActivated } = require('./localStore');
    if (isActivated && isActivated()) return 'connected';
  } catch {}
  return STATES[mongoose.connection.readyState] || 'unknown';
}

function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  const c = mongoose.connection;
  c.on('connected', () => console.log('[db] MongoDB connected'));
  c.on('disconnected', () => console.warn('[db] MongoDB disconnected - requests will fail with 503 until it reconnects'));
  c.on('reconnected', () => console.log('[db] MongoDB reconnected'));
  c.on('error', (err) => console.error('[db] MongoDB error:', err.message));
}

async function connectDB(uri) {
  attachListeners();
  mongoose.set('strictQuery', true);
  console.log(`[db] Connecting to ${redactUri(uri)} ...`);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500, // fail fast with clear fallback instead of hanging
      bufferTimeoutMS: 4000,
      maxPoolSize: 10,
    });
  } catch (err) {
    const wrapped = new Error(describeConnectionError(err));
    wrapped.cause = err;
    throw wrapped;
  }
  const { host, name } = mongoose.connection;
  console.log(`[db] Ready: database "${name}" on ${host}`);
  return mongoose.connection;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, dbState };
