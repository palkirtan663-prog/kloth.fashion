const test = require('node:test');
const assert = require('node:assert/strict');
const { mapError } = require('../src/middleware/errorHandler');

test('maps known errors to safe client responses', () => {
  assert.deepEqual(mapError({ type: 'entity.parse.failed' }), { status: 400, message: 'Request body is not valid JSON.' });
  assert.equal(mapError({ name: 'CastError', path: '_id' }).message, 'Invalid ID.');
  assert.equal(mapError({ name: 'ValidationError', errors: { a: { message: 'Bad A.' }, b: { message: 'Bad B.' } } }).message, 'Bad A. Bad B.');
  assert.equal(mapError({ code: 11000, keyPattern: { email: 1 } }).status, 409);
  assert.match(mapError({ code: 11000, keyPattern: { email: 1 } }).message, /email/);
  assert.match(mapError({ code: 11000, keyPattern: { name: 1 } }).message, /product/);
});

test('database outages become 503, not 500', () => {
  assert.equal(mapError({ name: 'MongooseServerSelectionError' }).status, 503);
  assert.equal(mapError({ name: 'MongoNetworkError' }).status, 503);
  assert.equal(mapError({ name: 'MongooseError', message: 'Operation `users.findOne()` buffering timed out after 5000ms' }).status, 503);
});

test('unknown errors never leak details', () => {
  const r = mapError(new Error('secret connection string mongodb://u:p@host'));
  assert.equal(r.status, 500);
  assert.ok(!/mongodb|secret/.test(r.message));
});
