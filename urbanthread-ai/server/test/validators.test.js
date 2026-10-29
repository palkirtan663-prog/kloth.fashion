const test = require('node:test');
const assert = require('node:assert/strict');
const v = require('../src/utils/validators');

test('register validation', () => {
  assert.equal(v.validateRegister({ name: 'Asha', email: 'a@b.co', password: 'abcdefg1' }), null);
  assert.match(v.validateRegister({ name: 'A', email: 'a@b.co', password: 'abcdefg1' }), /Name/);
  assert.match(v.validateRegister({ name: 'Asha', email: 'nope', password: 'abcdefg1' }), /email/i);
  assert.match(v.validateRegister({ name: 'Asha', email: 'a@b.co', password: 'short1' }), /8 to 72/);
  assert.match(v.validateRegister({ name: 'Asha', email: 'a@b.co', password: 'onlyletters' }), /letter and one number/);
  assert.match(v.validateRegister({ name: 'Asha', email: 'a@b.co', password: 'x'.repeat(73) + '1' }), /8 to 72/);
  assert.ok(v.validateRegister(undefined));
});

test('register rejects non-string (operator-object) values', () => {
  assert.ok(v.validateRegister({ name: 'Asha', email: { $ne: '' }, password: 'abcdefg1' }));
  assert.ok(v.validateRegister({ name: 'Asha', email: 'a@b.co', password: { $gt: '' } }));
});

test('login validation', () => {
  assert.equal(v.validateLogin({ email: 'a@b.co', password: 'x' }), null);
  assert.ok(v.validateLogin({ email: 'a@b.co', password: '' }));
  assert.ok(v.validateLogin({ email: { $ne: 1 }, password: 'x' }));
});

test('pickProductFields whitelists fields (no _id / createdAt / role injection)', () => {
  const out = v.pickProductFields({ name: 'X', price: 5, _id: 'abc', createdAt: 'x', role: 'admin', $where: '1' });
  assert.deepEqual(out, { name: 'X', price: 5 });
});

test('escapeRegex neutralises regex metacharacters', () => {
  const rx = new RegExp(v.escapeRegex('a.b(c)*'), 'i');
  assert.ok(rx.test('A.B(C)*'));
  assert.ok(!rx.test('axb(c)'));
});
