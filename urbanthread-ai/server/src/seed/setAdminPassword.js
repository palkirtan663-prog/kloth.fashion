/*
  setAdminPassword.js - CLI tool to securely set or reset an admin account password.
  Usage:
    node src/seed/setAdminPassword.js [email] [password]
*/
const bcrypt = require('bcryptjs');
const { loadEnvFile, loadConfig } = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const { activateLocalStore, isActivated } = require('../config/localStore');
const User = require('../models/User');
const { validateEmail, validatePassword } = require('../utils/validators');

loadEnvFile();
const { config } = loadConfig();

async function run() {
  const email = (process.argv[2] || config.adminEmail || 'admin@urbanthread.com').trim().toLowerCase();
  const password = process.argv[3] || config.adminPassword || 'UrbanThread@2026!';

  const emailErr = validateEmail(email);
  if (emailErr) {
    console.error('Invalid email:', emailErr);
    process.exit(1);
  }
  const passErr = validatePassword(password);
  if (passErr) {
    console.error('Invalid password:', passErr);
    process.exit(1);
  }

  let usingRemote = false;
  try {
    await connectDB(config.mongoUri);
    usingRemote = true;
  } catch (err) {
    console.log('[cli] MongoDB Atlas not reached (' + err.message + '). Updating local persistent storage.');
    activateLocalStore();
  }

  const hash = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email }).select('+passwordHash');

  if (existing) {
    existing.role = 'admin';
    existing.passwordHash = hash;
    await existing.save();
    console.log(`[success] Successfully updated admin account: ${email}`);
    console.log(`[info] Role: admin, Password hash refreshed.`);
  } else {
    await User.create({
      name: 'Kloth.fashion Admin',
      email,

      passwordHash: hash,
      role: 'admin',
    });
    console.log(`[success] Successfully created new admin account: ${email}`);
  }

  if (usingRemote) {
    await disconnectDB();
  }
  console.log('[done] You can now log into the admin portal with:');
  console.log(`       Email:    ${email}`);
  console.log(`       Password: ${password}`);
  process.exit(0);
}

run().catch((err) => {
  console.error('[error]', err.message);
  process.exit(1);
});
