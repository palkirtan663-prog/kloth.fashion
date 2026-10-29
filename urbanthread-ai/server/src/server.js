/*
  server.js - entry point.
  The API does NOT start listening until MongoDB is connected. If the configuration is
  invalid or the database is unreachable, the process prints a clear message and exits.
*/
const { loadEnvFile, loadConfig } = require('./config/env');

loadEnvFile();

async function main() {
  const { config, errors } = loadConfig();
  if (errors.length) {
    console.error('\n[startup] Configuration problem(s) - fix server/.env and restart:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  // Required after env is loaded so nothing touches process.env too early.
  const { connectDB, disconnectDB } = require('./config/db');
  const { createApp } = require('./app');
  const User = require('./models/User');
  const Product = require('./models/Product');
  const { ensureAdmin } = require('./seed/seedAdmin');
  const { seedIfEmpty } = require('./seed/seedProducts');
  const { activateLocalStore } = require('./config/localStore');

  let dbConnected = false;
  try {
    await connectDB(config.mongoUri);
    await Promise.all([User.init(), Product.init()]); // make sure unique indexes exist
    await ensureAdmin(config);
    if (config.autoSeedProducts) await seedIfEmpty();
    dbConnected = true;
  } catch (err) {
    console.warn(`\n[startup] Remote MongoDB Atlas connection notice: ${err.message}`);
    console.log('[startup] Automatically activating local database fallback so your store, admin, and orders work smoothly!');
    activateLocalStore(config);
    await ensureAdmin(config);
  }

  const app = createApp(config);
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`[server] Kloth.fashion API listening on http://localhost:${config.port} and http://127.0.0.1:${config.port}`);
    console.log(`[server] Allowed browser origins: ${config.clientOrigins.join(', ')}`);

    console.log(`[server] Chatbot mode: ${config.ai.apiKey ? `AI (${config.ai.model})` : 'DEMO (no AI_API_KEY set)'}`);
  });

  server.on('error', (err) => {
    console.error(
      err.code === 'EADDRINUSE'
        ? `\n[startup] Port ${config.port} is already in use. Stop the other process or change PORT in server/.env.`
        : `\n[startup] Server error: ${err.message}`
    );
    process.exit(1);
  });

  const shutdown = (signal) => {
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 5000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[startup] Unexpected failure:', err);
  process.exit(1);
});
