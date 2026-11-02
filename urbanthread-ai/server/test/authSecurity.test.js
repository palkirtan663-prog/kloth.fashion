const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadEnvFile, loadConfig } = require('../src/config/env');
loadEnvFile(path.join(__dirname, '../.env'));
const { config } = loadConfig();
const { activateLocalStore } = require('../src/config/localStore');
activateLocalStore(config);

const { login, adminLogin } = require('../src/controllers/authController');

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.data = obj;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
      return this;
    },
  };
  return res;
}

test('auth security: wrong password is strictly rejected with 401', async () => {
  const reqWrongAdmin = {
    body: {
      email: 'admin@urbanthread.com',
      password: 'wrongPassword123!',
    },
    app: { locals: { config } },
  };
  const resWrongAdmin = createMockRes();
  await adminLogin(reqWrongAdmin, resWrongAdmin);

  assert.equal(resWrongAdmin.statusCode, 401, 'Wrong admin password must be rejected with HTTP 401');
  assert.match(resWrongAdmin.data.error, /invalid.*password/i);

  const reqWrongCust = {
    body: {
      email: 'customer@kloth.fashion',
      password: 'invalidPassword999',
    },
    app: { locals: { config } },
  };
  const resWrongCust = createMockRes();
  await login(reqWrongCust, resWrongCust);

  assert.equal(resWrongCust.statusCode, 401, 'Wrong customer password must be rejected with HTTP 401');
  assert.match(resWrongCust.data.error, /invalid.*password/i);

  const reqUnknown = {
    body: {
      email: 'nonexistent_attacker@evil.com',
      password: 'SomePassword123!',
    },
    app: { locals: { config } },
  };
  const resUnknown = createMockRes();
  await login(reqUnknown, resUnknown);

  assert.equal(resUnknown.statusCode, 401, 'Unknown email must be rejected with HTTP 401');
});

test('auth security: correct credentials succeed with 200 and signed JWT', async () => {
  const reqAdmin = {
    body: {
      email: 'admin@urbanthread.com',
      password: 'babal@9987',
    },
    app: { locals: { config } },
  };
  const resAdmin = createMockRes();
  await adminLogin(reqAdmin, resAdmin);

  assert.equal(resAdmin.statusCode, 200, 'Valid admin credentials must return HTTP 200');
  assert.ok(resAdmin.data.token, 'Must issue a valid signed JWT token');
  assert.equal(resAdmin.data.user.role, 'admin', 'User must have role admin');

  const reqCust = {
    body: {
      email: 'customer@kloth.fashion',
      password: 'Customer@123',
    },
    app: { locals: { config } },
  };
  const resCust = createMockRes();
  await login(reqCust, resCust);

  assert.equal(resCust.statusCode, 200, 'Valid customer credentials must return HTTP 200');
  assert.ok(resCust.data.token, 'Must issue a valid signed JWT token');
  assert.equal(resCust.data.user.role, 'user', 'User must have role user');
});
