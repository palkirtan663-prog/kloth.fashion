/*
  importLegacyUsers.js - one-time migration of accounts from the OLD JSON storage
  (server/data/users.json) into MongoDB. Existing bcrypt hashes are kept, so those users
  can log in with their old passwords. Already-migrated emails are skipped.

    npm run migrate:users
*/
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { EMAIL_RE, ROLES } = require('../utils/validators');

const LEGACY_FILE = path.join(__dirname, '..', '..', 'data', 'users.json');

const legacyName = (n) => {
  const name = String(n || '').trim().slice(0, 50);
  return name.length >= 2 ? name : 'User';
};

async function importLegacyUsers(file = LEGACY_FILE) {
  if (!fs.existsSync(file)) return { found: false, imported: 0, skipped: 0, invalid: 0 };

  const list = JSON.parse(fs.readFileSync(file, 'utf8'));
  let imported = 0, skipped = 0, invalid = 0;

  for (const u of Array.isArray(list) ? list : []) {
    const email = String(u && u.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email) || typeof u.passwordHash !== 'string' || !u.passwordHash.startsWith('$2')) {
      invalid += 1;
      continue;
    }
    if (await User.exists({ email })) {
      skipped += 1;
      continue;
    }
    await User.create({
      name: legacyName(u.name),
      email,
      passwordHash: u.passwordHash,
      role: ROLES.includes(u.role) ? u.role : 'user',
      createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
    });
    imported += 1;
  }
  return { found: true, imported, skipped, invalid };
}

module.exports = { importLegacyUsers };

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
      const r = await importLegacyUsers();
      console.log(
        r.found
          ? `[migrate] ${r.imported} imported, ${r.skipped} already in MongoDB, ${r.invalid} invalid and skipped.`
          : '[migrate] No server/data/users.json found - nothing to migrate.'
      );
      await disconnectDB();
    } catch (err) {
      console.error(`[migrate] Failed: ${err.message}`);
      process.exit(1);
    }
  })();
}
