/*
  env.js - read and validate configuration from environment variables.

  loadEnvFile()  loads server/.env into process.env (dotenv is required lazily).
  loadConfig()   is pure: it validates an env object and returns { config, errors }.
  Nothing here ever hardcodes a credential.
*/
const path = require('path');

const WEAK_SECRET = /^(replace|change-this|your-|secret$|password$)/i;
const PLACEHOLDER_URI = /<[^>]*>|your[_-]?(password|username)/i;

function loadEnvFile(envPath) {
  const targetPath = envPath || path.join(__dirname, '..', '..', '.env');
  try {
    let dotenv;
    try {
      dotenv = require('dotenv');
    } catch {
      dotenv = require(path.join(__dirname, '..', '..', 'node_modules', 'dotenv'));
    }
    dotenv.config({ path: targetPath, quiet: true });
  } catch (err) {
    // Safe fallback .env parser
    try {
      const fs = require('fs');
      if (fs.existsSync(targetPath)) {
        const lines = fs.readFileSync(targetPath, 'utf8').split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eq = trimmed.indexOf('=');
          if (eq > 0) {
            const key = trimmed.slice(0, eq).trim();
            const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = val;
          }
        }
      }
    } catch {}
  }
}

function toInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function loadConfig(env = process.env) {
  const errors = [];

  const mongoUri = (env.MONGODB_URI || '').trim();
  if (!mongoUri) {
    errors.push('MONGODB_URI is not set. Add it to server/.env (see server/.env.example).');
  } else if (!/^mongodb(\+srv)?:\/\//i.test(mongoUri)) {
    errors.push('MONGODB_URI must start with "mongodb://" or "mongodb+srv://".');
  } else if (PLACEHOLDER_URI.test(mongoUri)) {
    errors.push('MONGODB_URI still contains a placeholder such as <db_password>. Replace it with your real values.');
  }

  const jwtSecret = (env.JWT_SECRET || '').trim();
  if (!jwtSecret) {
    errors.push('JWT_SECRET is not set. Generate one: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  } else if (WEAK_SECRET.test(jwtSecret) || jwtSecret.length < 32) {
    errors.push('JWT_SECRET is a placeholder or shorter than 32 characters. Generate a long random value.');
  }

  const clientOrigins = (env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const config = {
    port: toInt(env.PORT, 5000),
    mongoUri,
    jwtSecret,
    jwtExpiresIn: (env.JWT_EXPIRES_IN || '2h').trim(),
    clientOrigins,
    adminEmail: (env.ADMIN_EMAIL || '').trim().toLowerCase(),
    adminPassword: env.ADMIN_PASSWORD || '',
    autoSeedProducts: String(env.AUTO_SEED_PRODUCTS || 'true').toLowerCase() !== 'false',
    ai: {
      apiKey: (env.AI_API_KEY || '').trim(),
      baseUrl: (env.AI_BASE_URL || 'https://api.openai.com/v1').trim().replace(/\/+$/, ''),
      model: (env.AI_MODEL || 'gpt-4o-mini').trim(),
      timeoutMs: toInt(env.AI_TIMEOUT_MS, 15000),
    },
  };

  return { config, errors };
}

module.exports = { loadEnvFile, loadConfig };
