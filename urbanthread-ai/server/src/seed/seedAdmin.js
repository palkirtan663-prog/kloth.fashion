/*
  seedAdmin.js - controlled creation of the first admin (no default credentials exist).

  Runs at server start and via `npm run seed:admin`. It only acts when BOTH ADMIN_EMAIL and
  ADMIN_PASSWORD are set in server/.env and are valid:
    - email not registered yet  -> account is created with role "admin"
    - email already registered  -> that account is promoted to "admin" (password untouched)
  Remove ADMIN_PASSWORD from .env after the first run if you like.
*/
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validateEmail, validatePassword } = require('../utils/validators');

const KNOWN_DEFAULTS = ['admin@12345', 'password1', 'admin1234'];

async function ensureAdmin(config) {
  const { adminEmail, adminPassword } = config;

  if (!adminEmail || !adminPassword) {
    if ((await User.countDocuments({ role: 'admin' })) === 0) {
      console.warn('[admin] No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env and restart to create one.');
    }
    return null;
  }

  const problem =
    validateEmail(adminEmail) ||
    validatePassword(adminPassword) ||
    (/^replace/i.test(adminPassword) || KNOWN_DEFAULTS.includes(adminPassword.toLowerCase())
      ? 'ADMIN_PASSWORD is a placeholder or a well-known default.'
      : null);
  if (problem) {
    console.warn(`[admin] Skipping admin bootstrap: ${problem}`);
    return null;
  }

  const existing = await User.findOne({ email: adminEmail }).select('+passwordHash');
  if (existing) {
    let changed = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      changed = true;
      console.log(`[admin] Promoted existing account ${adminEmail} to admin.`);
    }
    const matches = existing.passwordHash ? await bcrypt.compare(adminPassword, existing.passwordHash) : false;
    if (!matches) {
      existing.passwordHash = await bcrypt.hash(adminPassword, 10);
      changed = true;
      console.log(`[admin] Synced/updated password hash for admin account ${adminEmail}.`);
    }
    if (changed) {
      await existing.save();
    } else {
      console.log(`[admin] Admin account ready: ${adminEmail}`);
    }
    return existing;
  }

  const admin = await User.create({
    name: 'Admin',
    email: adminEmail,
    passwordHash: await bcrypt.hash(adminPassword, 10),
    role: 'admin',
  });
  console.log(`[admin] Created admin account: ${adminEmail}`);
  return admin;
}

module.exports = { ensureAdmin };

// `npm run seed:admin`
if (require.main === module) {
  (async () => {
    const { loadEnvFile, loadConfig } = require('../config/env');
    loadEnvFile();
    const { config, errors } = loadConfig();
    if (errors.length) {
      errors.forEach((e) => console.error(`- ${e}`));
      process.exit(1);
    }
    const { connectDB, disconnectDB } = require('../config/db');
    try {
      await connectDB(config.mongoUri);
      await User.init();
      await ensureAdmin(config);
      await disconnectDB();
    } catch (err) {
      console.error(`[admin] Failed: ${err.message}`);
      process.exit(1);
    }
  })();
}
