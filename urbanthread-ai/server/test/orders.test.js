const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loadEnvFile, loadConfig } = require('../src/config/env');
loadEnvFile(path.join(__dirname, '../.env'));
const { config } = loadConfig();
const { activateLocalStore } = require('../src/config/localStore');
activateLocalStore(config);

const Product = require('../src/models/Product');
const { getLiveOffers, createOrder, getMyOrders, cancelOrder } = require('../src/controllers/orderController');

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

test('live offers returns valid promo code catalogue', () => {
  const mockRes = createMockRes();
  getLiveOffers({}, mockRes);
  assert.ok(Array.isArray(mockRes.data.offers));
  assert.ok(mockRes.data.offers.some((o) => o.code === 'STREET20'));
  assert.ok(mockRes.data.offers.some((o) => o.code === 'FIRSTBUY'));
  assert.ok(mockRes.data.offers.some((o) => o.code === 'FREESHIP'));
});

test('createOrder rejects missing or incomplete shipping address', async () => {
  const mockRes = createMockRes();
  await createOrder({ body: { items: [{ id: 'p1', quantity: 1 }] } }, mockRes);
  assert.equal(mockRes.statusCode, 400);
  assert.match(mockRes.data.error, /shipping address is required/i);

  const mockRes2 = createMockRes();
  await createOrder(
    {
      body: {
        items: [{ id: 'p1', quantity: 1 }],
        shippingAddress: { fullName: 'A' },
      },
    },
    mockRes2
  );
  assert.equal(mockRes2.statusCode, 400);
  assert.match(mockRes2.data.error, /recipient full name/i);
});

test('createOrder handles full guest checkout, inventory decrement, order history and stock restoration', async () => {
  // 1. Get first available product
  const products = await Product.find({});
  assert.ok(products.length > 0, 'Products catalogue must exist');
  const prod = products[0];
  const originalStock = prod.stock;

  // 2. Perform Guest Checkout
  const guestEmail = `testbuyer_${Date.now()}@kloth.fashion`;
  const mockRes = createMockRes();
  const req = {
    body: {
      items: [
        {
          id: prod._id.toString(),
          name: prod.name,
          price: prod.price,
          quantity: 2,
          size: 'L',
        },
      ],
      shippingAddress: {
        fullName: 'Kirtan Pal',
        email: guestEmail,
        phone: '9876543210',
        street: '402 High Street Atelier',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
      },
      payment: { method: 'COD' },
      promoCode: 'STREET20',
    },
  };

  await createOrder(req, mockRes);
  assert.equal(mockRes.statusCode, 201);
  assert.ok(mockRes.data.order, 'Order must be created');
  assert.ok(mockRes.data.token, 'Guest JWT must be returned');

  const createdOrder = mockRes.data.order;
  assert.equal(createdOrder.payment.method, 'COD');
  assert.ok(createdOrder.discount > 0, 'STREET20 discount must apply');

  // Verify stock decremented
  const prodAfter = await Product.findById(prod._id);
  assert.equal(prodAfter.stock, originalStock - 2, 'Stock must decrement by 2');

  // 3. Verify duplicate order debounce within 15 seconds returns existing order idempotently
  const mockResDup = createMockRes();
  await createOrder(req, mockResDup);
  assert.equal(mockResDup.statusCode, 200, 'Duplicate request must return 200 idempotently');
  assert.equal(mockResDup.data.order._id.toString(), createdOrder._id.toString(), 'Must return identical existing order');
  assert.match(mockResDup.data.notice, /already confirmed/i, 'Must include already confirmed notice');

  // 4. Test order retrieval via getMyOrders
  const mockResOrders = createMockRes();
  await getMyOrders({ user: { id: createdOrder.user } }, mockResOrders);
  assert.equal(mockResOrders.statusCode, 200);
  assert.ok(Array.isArray(mockResOrders.data.orders));
  assert.ok(mockResOrders.data.orders.some((o) => o._id.toString() === createdOrder._id.toString()));

  // 5. Test cancel order restores stock
  const mockResCancel = createMockRes();
  await cancelOrder(
    {
      params: { id: createdOrder._id.toString() },
      user: { id: createdOrder.user, role: 'customer' },
    },
    mockResCancel
  );
  assert.equal(mockResCancel.statusCode, 200);

  // Verify stock restored
  const prodRestored = await Product.findById(prod._id);
  assert.equal(prodRestored.stock, originalStock, 'Stock must be restored on cancellation');
});

test('createOrder rejects orders exceeding available stock', async () => {
  const products = await Product.find({});
  const prod = products[0];

  const mockRes = createMockRes();
  const req = {
    body: {
      items: [
        {
          id: prod._id.toString(),
          name: prod.name,
          price: prod.price,
          quantity: prod.stock + 999, // Exceeds stock
        },
      ],
      shippingAddress: {
        fullName: 'Kirtan Pal',
        email: 'overseller@kloth.fashion',
        phone: '9876543210',
        street: '402 High Street Atelier',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
      },
      payment: { method: 'COD' },
    },
  };

  await createOrder(req, mockRes);
  assert.equal(mockRes.statusCode, 400);
  assert.match(mockRes.data.error, /only .* in stock/i);
});
