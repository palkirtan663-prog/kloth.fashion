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
  if (mongoose.connection.readyState === 1) return 'connected';
  try {
    const { isActivated } = require('./localStore');
    if (isActivated && isActivated()) return 'local-storage';
  } catch {}
  return STATES[mongoose.connection.readyState] || 'unknown';
}

function getDatabaseInfo() {
  const isMongo = mongoose.connection.readyState === 1;
  const state = dbState();
  return {
    state,
    storageType: isMongo ? 'mongodb-atlas' : (state === 'local-storage' ? 'local-fallback' : 'disconnected'),
    databaseName: isMongo ? mongoose.connection.name : (state === 'local-storage' ? 'Kloth (localStore)' : null),
    host: isMongo ? mongoose.connection.host : null,
    isAtlasLive: isMongo,
  };
}

function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  const c = mongoose.connection;
  c.on('connected', () => console.log('[db] MongoDB Atlas connected successfully'));
  c.on('disconnected', () => console.warn('[db] MongoDB disconnected - requests will fail with 503 until it reconnects'));
  c.on('reconnected', () => console.log('[db] MongoDB reconnected'));
  c.on('error', (err) => console.error('[db] MongoDB error:', err.message));
}

function normalizeMongoUri(rawUri) {
  let uri = String(rawUri || '').trim();
  if (uri.startsWith('mongodb+srv://') && !uri.includes('?')) {
    uri += '?retryWrites=true&w=majority&appName=Cluster0';
  }
  return uri;
}

async function connectDB(rawUri) {
  attachListeners();
  mongoose.set('strictQuery', true);
  const uri = normalizeMongoUri(rawUri);
  console.log(`[db] Connecting to ${redactUri(uri)} ...`);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });
  } catch (err) {
    const wrapped = new Error(describeConnectionError(err));
    wrapped.cause = err;
    throw wrapped;
  }
  const { host, name } = mongoose.connection;
  console.log(`[db] Ready: MongoDB Atlas database "${name}" on ${host}`);
  return mongoose.connection;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB, dbState, getDatabaseInfo, normalizeMongoUri };
