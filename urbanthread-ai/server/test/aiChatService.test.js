const test = require('node:test');
const assert = require('node:assert/strict');
const { getChatReply, buildDemoReply, parseModelReply, parseBudget } = require('../src/services/aiChatService');

const P = (id, name, price, category, color, rating = 4.5) => ({ id, name, price, category, color, rating, description: `${name} desc.` });
const products = [
  P('1', 'Midnight Box Tee', 899, 'T-Shirts', 'Black', 4.7),
  P('2', 'Noir Oversized Tee', 999, 'T-Shirts', 'Black', 4.5),
  P('3', 'Signal Hoodie', 1999, 'Hoodies', 'Grey'),
  P('4', 'Studio Cargo', 2199, 'Bottomwear', 'Olive', 4.9),
  P('5', 'Everyday Wide Pant', 1799, 'Bottomwear', 'Sand'),
];
const ai = { apiKey: 'test-key', baseUrl: 'http://ai.test/v1', model: 'm', timeoutMs: 50 };

test('demo: category + budget', () => {
  const r = buildDemoReply('black tee under ₹1,000', products);
  assert.match(r, /Midnight Box Tee \(₹899\)/);
  assert.match(r, /Noir Oversized Tee \(₹999\)/);
  assert.ok(!/Hoodie|Cargo/.test(r));
});

test('demo: regression - a hoodie question must NOT return bottomwear (old matcher matched "" for Bottomwear)', () => {
  const r = buildDemoReply('show me a hoodie', products);
  assert.match(r, /Signal Hoodie/);
  assert.ok(!/Cargo|Wide Pant/.test(r));
});

test('demo: cargo, name, nothing-in-budget, unknown, empty catalogue', () => {
  assert.match(buildDemoReply('show me cargos', products), /Studio Cargo/);
  assert.match(buildDemoReply('tell me about Studio Cargo', products), /Studio Cargo/);
  assert.match(buildDemoReply('hoodie under 500', products), /don’t have anything.*Signal Hoodie/);
  assert.match(buildDemoReply('hello?', products), /Try asking me something specific/);
  assert.match(buildDemoReply('anything', []), /catalogue is empty/);
});

test('budget parsing', () => {
  assert.equal(parseBudget('tee under ₹1,000'), 1000);
  assert.equal(parseBudget('below 1.5k'), 1500);
  assert.equal(parseBudget('hello'), null);
});

test('demo mode is reported honestly and never calls the network', async () => {
  const r = await getChatReply({ message: 'tee', products, ai: { ...ai, apiKey: '' }, fetchImpl: () => { throw new Error('must not be called'); } });
  assert.equal(r.mode, 'demo');
});

const okFetch = (content) => async () => ({ ok: true, json: async () => ({ choices: [{ message: { content } }] }) });

test('ai mode: valid JSON with real product ids', async () => {
  const r = await getChatReply({ message: 'tee', products, ai, fetchImpl: okFetch('```json\n{"reply":"Try the Midnight Box Tee.","productIds":["1"]}\n```') });
  assert.equal(r.mode, 'ai');
  assert.deepEqual(r.productIds, ['1']);
});

test('ai mode: falls back (mode "fallback") on bad JSON, unknown product, HTTP error, network error, timeout', async () => {
  const origWarn = console.warn; console.warn = () => {};
  try {
    const cases = {
      'bad json': okFetch('not json at all'),
      'unknown product': okFetch('{"reply":"Buy this","productIds":["999"]}'),
      'empty reply': okFetch('{"reply":"","productIds":[]}'),
      'http 500': async () => ({ ok: false, status: 500 }),
      'network': async () => { throw new Error('ECONNRESET'); },
      'timeout': (url, opts) => new Promise((_, rej) => opts.signal.addEventListener('abort', () => rej(Object.assign(new Error('aborted'), { name: 'AbortError' })))),
    };
    for (const [name, fetchImpl] of Object.entries(cases)) {
      const r = await getChatReply({ message: 'show me cargos', products, ai, fetchImpl });
      assert.equal(r.mode, 'fallback', name);
      assert.match(r.reply, /Studio Cargo/, name);
    }
  } finally { console.warn = origWarn; }
});

test('ai request sends the key only in the Authorization header and the catalogue ids', async () => {
  let seen;
  await getChatReply({ message: 'tee', products, ai, fetchImpl: async (url, opts) => { seen = { url, opts }; return { ok: true, json: async () => ({ choices: [{ message: { content: '{"reply":"ok","productIds":[]}' } }] }) }; } });
  assert.equal(seen.url, 'http://ai.test/v1/chat/completions');
  assert.equal(seen.opts.headers.Authorization, 'Bearer test-key');
  assert.ok(!seen.opts.body.includes('test-key'));
  assert.match(seen.opts.body, /Midnight Box Tee/);
});

test('parseModelReply truncates very long replies', () => {
  const r = parseModelReply(JSON.stringify({ reply: 'x'.repeat(2000), productIds: [] }), products);
  assert.ok(r.reply.length <= 600);
});
