const http = require('http');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

const { loadConfig } = require('../server/src/config/env');
const { activateLocalStore } = require('../server/src/config/localStore');
const { createApp } = require('../server/src/app');

async function testDeployment() {
  console.log('🧪 Verifying Full-Stack Deployment Readiness & Static Assets Serving...');

  const { config } = loadConfig({
    PORT: '5199',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/deploy_test',
    JWT_SECRET: 'test_jwt_secret_with_sufficient_length_kloth_fashion_2026',
    CLIENT_ORIGINS: 'http://localhost:5173',
  });

  // Activate local fallback
  activateLocalStore(config);

  const app = createApp(config);

  function invoke(method, url, headers = {}, body = null) {
    return new Promise((resolve, reject) => {
      const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
      const req = new Readable({
        read() {
          if (payload) {
            this.push(payload);
          }
          this.push(null);
        }
      });

      req.method = method;
      req.url = url;
      req.path = url.split('?')[0];
      req.headers = {
        host: 'localhost:5199',
        ...(payload ? { 'content-length': Buffer.byteLength(payload), 'content-type': 'application/json' } : {}),
        ...headers
      };
      req.socket = { remoteAddress: '127.0.0.1', encrypted: false };
      req.connection = req.socket;

      let resHeaders = {};
      let statusCode = 200;
      let chunks = [];

      const res = {
        statusCode: 200,
        headersSent: false,
        setHeader: (k, v) => { resHeaders[k.toLowerCase()] = v; },
        getHeader: (k) => resHeaders[k.toLowerCase()],
        removeHeader: (k) => { delete resHeaders[k.toLowerCase()]; },
        status: (code) => { res.statusCode = code; statusCode = code; return res; },
        writeHead: (code, reasonOrHeaders, maybeHeaders) => {
          res.statusCode = code;
          statusCode = code;
          const h = typeof reasonOrHeaders === 'object' ? reasonOrHeaders : maybeHeaders;
          if (h) Object.entries(h).forEach(([k, v]) => { resHeaders[k.toLowerCase()] = v; });
          return res;
        },
        write: (chunk) => {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          return true;
        },
        end: (chunk) => {
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          res.headersSent = true;
          const fullBody = Buffer.concat(chunks).toString('utf8');
          let parsedJson = null;
          try { parsedJson = JSON.parse(fullBody); } catch {}
          resolve({ status: statusCode, headers: resHeaders, body: fullBody, json: parsedJson });
        },
        on: () => res,
        once: () => res,
        emit: () => true,
      };

      app(req, res, (err) => {
        if (err) return reject(err);
        resolve({ status: 404, headers: resHeaders, body: 'Not handled' });
      });
    });
  }

  // 1. Test root route / (should serve client/dist/index.html)
  const rootRes = await invoke('GET', '/');
  console.log('1. Root GET / Status:', rootRes.status, 'HTML includes Kloth.fashion:', rootRes.body.includes('Kloth.fashion'));
  if (rootRes.status !== 200 || !rootRes.body.includes('Kloth.fashion')) {
    throw new Error('Failed to serve React client index.html at /');
  }

  // 2. Test SPA fallback route /admin/login (should also return index.html)
  const spaRes = await invoke('GET', '/admin/login');
  console.log('2. SPA Client Route GET /admin/login Status:', spaRes.status, 'Served index.html:', spaRes.body.includes('root'));
  if (spaRes.status !== 200 || !spaRes.body.includes('root')) {
    throw new Error('Failed to serve SPA fallback for client routes');
  }

  // 3. Test API Health /api/health
  const healthRes = await invoke('GET', '/api/health');
  console.log('3. API GET /api/health Status:', healthRes.status, healthRes.json);
  if (healthRes.status !== 200 || !healthRes.json.ok) {
    throw new Error('/api/health failed');
  }

  // 4. Test API Products /api/products
  const prodRes = await invoke('GET', '/api/products');
  console.log('4. API GET /api/products Status:', prodRes.status, 'Count:', prodRes.json.length);
  if (prodRes.status !== 200 || !Array.isArray(prodRes.json) || prodRes.json.length === 0) {
    throw new Error('/api/products failed');
  }

  // 5. Test API 404 handler /api/unknown-endpoint (should return JSON 404)
  const notFoundRes = await invoke('GET', '/api/some-nonexistent-api');
  console.log('5. API GET /api/some-nonexistent-api Status:', notFoundRes.status, notFoundRes.json);
  if (notFoundRes.status !== 404 || !notFoundRes.json.error) {
    throw new Error('Expected JSON 404 for unknown /api route');
  }

  // 6. Test Newsletter API /api/marketing/newsletter
  const newsRes = await invoke('POST', '/api/marketing/newsletter', {}, { email: 'deployment_test@kloth.fashion' });
  console.log('6. API POST /api/marketing/newsletter Status:', newsRes.status, newsRes.json);
  if (newsRes.status !== 200 || !newsRes.json.ok) {
    throw new Error('Newsletter endpoint failed');
  }

  // 7. Test Public Banners API /api/marketing/banners
  const bannerRes = await invoke('GET', '/api/marketing/banners');
  console.log('7. API GET /api/marketing/banners Status:', bannerRes.status, 'Banners count:', bannerRes.json.banners?.length);
  if (bannerRes.status !== 200 || !bannerRes.json.banners?.length) {
    throw new Error('Public banners endpoint failed');
  }

  console.log('\n🌟 DEPLOYMENT VERIFICATION PASSED 100%! All static assets and API routes work flawlessly.');
}

testDeployment().catch((err) => {
  console.error('❌ Deployment verification failed:', err);
  process.exit(1);
});
