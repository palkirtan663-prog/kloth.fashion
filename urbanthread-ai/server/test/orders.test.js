const test = require('node:test');
const assert = require('node:assert/strict');
const { getLiveOffers } = require('../src/controllers/orderController');

test('live offers returns valid promo code catalogue', () => {
  let jsonResult;
  const mockRes = {
    json(data) { jsonResult = data; },
  };
  getLiveOffers({}, mockRes);
  assert.ok(Array.isArray(jsonResult.offers));
  assert.ok(jsonResult.offers.some((o) => o.code === 'STREET20'));
  assert.ok(jsonResult.offers.some((o) => o.code === 'FIRSTBUY'));
  assert.ok(jsonResult.offers.some((o) => o.code === 'FREESHIP'));
});
