const { PRODUCTS } = require('../server/src/seed/seedProducts');

async function testAll() {
  console.log(`Checking ${PRODUCTS.length} products...`);
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    try {
      const res = await fetch(p.image, { method: 'HEAD' });
      const ct = res.headers.get('content-type');
      console.log(`${i + 1}. [${res.status}] ${p.category} | ${p.name} | ${p.image}`);
    } catch (e) {
      console.log(`${i + 1}. [ERR] ${p.category} | ${p.name} | ${e.message}`);
    }
  }
}

testAll();
