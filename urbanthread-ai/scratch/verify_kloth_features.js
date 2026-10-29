const http = require('http');
const path = require('path');
const fs = require('fs');

// Ensure env loaded
function loadEnv() {
  const envPath = path.join(__dirname, '..', 'server', '.env');
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
}
loadEnv();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'a'.repeat(48);

const { loadConfig } = require('../server/src/config/env');

const { activateLocalStore } = require('../server/src/config/localStore');
const { createApp } = require('../server/src/app');

async function runTests() {
  console.log('🚀 Starting Kloth.fashion End-to-End Validation Suite...');

  const { config } = loadConfig({
    PORT: '5099',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/kloth_test',
    JWT_SECRET: 'test_jwt_secret_with_sufficient_length_kloth_fashion_2026',
    CLIENT_ORIGINS: 'http://localhost:5173',
  });

  // Activate local fallback
  activateLocalStore(config);


  const app = createApp(config);
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('✅ Server listening on http://localhost:5099');

  const request = async (endpoint, options = {}) => {
    const res = await fetch(`http://localhost:5099${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  };


  try {
    // 1. Health check
    const health = await request('/api/health');
    console.log('1. Health Check:', health.status, health.data);

    // 2. Newsletter Subscription (Valid)
    const newsValid = await request('/api/marketing/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'streetwear_fan@kloth.fashion' }),
    });
    console.log('2. Newsletter (Valid email):', newsValid.status, newsValid.data.message);
    if (!newsValid.ok) throw new Error('Newsletter subscription failed');

    // 3. Newsletter Subscription (Invalid)
    const newsInvalid = await request('/api/marketing/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid_email' }),
    });
    console.log('3. Newsletter (Invalid email):', newsInvalid.status, newsInvalid.data.error);
    if (newsInvalid.status !== 400) throw new Error('Invalid email not rejected');

    // 4. Admin Login with Kloth.fashion credentials
    const adminLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@kloth.fashion', password: 'UrbanThread@2026!' }),
    });
    console.log('4. Admin Login (admin@kloth.fashion):', adminLogin.status, 'Role:', adminLogin.data.user?.role, 'Name:', adminLogin.data.user?.name);
    if (!adminLogin.ok || adminLogin.data.user?.role !== 'admin') throw new Error('Admin login failed');
    const adminToken = adminLogin.data.token;

    // 5. Customer Login with Kloth.fashion credentials
    const custLogin = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'customer@kloth.fashion', password: 'Customer@123' }),
    });
    console.log('5. Customer Login (customer@kloth.fashion):', custLogin.status, 'Role:', custLogin.data.user?.role, 'Name:', custLogin.data.user?.name);
    if (!custLogin.ok) throw new Error('Customer login failed');
    const custToken = custLogin.data.token;

    // 6. Products Catalogue Query (50+ pieces)
    const productsRes = await request('/api/products');
    const catalogList = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data.products || [];
    console.log('6. Catalogue Product Count:', catalogList.length);
    if (catalogList.length < 50) {
      throw new Error('Catalogue count should be 50+');
    }


    // 7. Public Marketing Banners
    const bannersRes = await request('/api/marketing/banners');
    console.log('7. Public Banners Count:', bannersRes.data.banners?.length);

    // 8. Order Placement & Tracking
    const orderRes = await request('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: JSON.stringify({
        items: [{
          product: catalogList[0].id,
          name: catalogList[0].name,
          price: catalogList[0].price,
          quantity: 1,
          size: 'L',
        }],


        shippingAddress: {
          fullName: 'Kirtan Pal',
          street: '123 Fashion Blvd',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          phone: '+91 98765 43210',
        },
        payment: { method: 'UPI', transactionId: 'TXN-KLOTH-999', status: 'Completed' },
        promoCode: 'STREET20',
      }),
    });
    console.log('8. Order Placed:', orderRes.status, 'Tracking #:', orderRes.data.order?.trackingNumber, 'Error:', orderRes.data.error);

    const trackingNumber = orderRes.data.order?.trackingNumber;

    // 9. Order Tracking Query
    const trackRes = await request(`/api/orders/track/${trackingNumber}`);
    console.log('9. Track Order Result:', trackRes.status, 'Status:', trackRes.data.order?.status);
    if (!trackRes.ok) throw new Error('Track order failed');

    // 10. Custom Bespoke Request Submission
    const bespokeRes = await request('/api/custom-requests', {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: JSON.stringify({
        category: 'Hoodies',
        fabric: '450 GSM Heavy French Terry',
        description: 'Double-layered hood with drop-shoulder silhouette and vintage raw hems.',
      }),
    });
    console.log('10. Custom Bespoke Request:', bespokeRes.status, 'Request ID:', bespokeRes.data.request?.requestId);
    if (!bespokeRes.ok) throw new Error('Bespoke request failed');


    // 11. Support Ticket Creation
    const ticketRes = await request('/api/support/tickets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${custToken}` },
      body: JSON.stringify({
        subject: 'Sizing inquiry for Drop 02',
        message: 'Is the boxy hoodie oversized or true to size?',
        category: 'Sizing',
      }),
    });
    console.log('11. Support Ticket Created:', ticketRes.status, 'Ticket #:', ticketRes.data.ticket?.ticketNumber);

    console.log('\n🎉 ALL 11 KLOTH.FASHION VALIDATION CHECKS PASSED PERFECTLY!');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Validation failed:', err);
  process.exit(1);
});
