const test = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig } = require('../src/config/env');
const { redactUri, describeConnectionError } = require('../src/utils/dbErrors');

const good = { MONGODB_URI: 'mongodb://127.0.0.1:27017/urbanthread', JWT_SECRET: 'a'.repeat(48) };

test('valid config has no errors and sane defaults', () => {
  const { config, errors } = loadConfig(good);
  assert.deepEqual(errors, []);
  assert.equal(config.port, 5000);
  assert.deepEqual(config.clientOrigins, ['http://localhost:5173', 'http://127.0.0.1:5173']);
  assert.equal(config.ai.apiKey, '');
  assert.equal(config.autoSeedProducts, true);
});

test('missing / placeholder values are reported', () => {
  assert.equal(loadConfig({}).errors.length, 2);
  assert.ok(loadConfig({ ...good, JWT_SECRET: 'replace-with-a-long-random-string' }).errors.length === 1);
  assert.ok(loadConfig({ ...good, JWT_SECRET: 'short' }).errors.length === 1);
  assert.match(loadConfig({ ...good, MONGODB_URI: 'mongodb+srv://<db_username>:<db_password>@c.mongodb.net/x' }).errors[0], /placeholder/);
  assert.match(loadConfig({ ...good, MONGODB_URI: 'http://wrong' }).errors[0], /mongodb/);
});

test('client origins are normalised; AUTO_SEED can be disabled', () => {
  const { config } = loadConfig({ ...good, CLIENT_ORIGIN: 'http://a.com/, http://b.com', AUTO_SEED_PRODUCTS: 'false' });
  assert.deepEqual(config.clientOrigins, ['http://a.com', 'http://b.com']);
  assert.equal(config.autoSeedProducts, false);
});

test('connection strings are redacted before logging', () => {
  assert.equal(redactUri('mongodb+srv://user:p%40ss@cluster0.abc.mongodb.net/db?retryWrites=true'), 'mongodb+srv://***@cluster0.abc.mongodb.net/db');
  assert.equal(redactUri('mongodb://127.0.0.1:27017/urbanthread'), 'mongodb://127.0.0.1:27017/urbanthread');
  assert.ok(!redactUri('mongodb://u:secret@h/db').includes('secret'));
});

test('connection errors are explained', () => {
  assert.match(describeConnectionError(new Error('bad auth : Authentication failed.')), /username and password/);
  assert.match(describeConnectionError(new Error('querySrv ENOTFOUND _mongodb._tcp.x')), /host could not be found/);
  assert.match(describeConnectionError(new Error('connect ECONNREFUSED 127.0.0.1:27017')), /running/);
  assert.match(describeConnectionError(new Error('Server selection timed out after 10000 ms')), /Network Access/);
});
